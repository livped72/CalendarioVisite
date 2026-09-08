export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const id = req.query.id as string;
  if (!id) {
    res.status(400).json({ error: 'ID account mancante' });
    return;
  }

  const GIST_ID = 'ca1bee040d283afc5013b65e7ecc2725';
  const TOKEN = process.env.GITHUB_TOKEN;

  if (!TOKEN) {
    res.status(500).json({ error: 'Configurazione database (Gist) mancante' });
    return;
  }

  try {
    // 1. Leggi lo stato attuale del Gist
    const getRes = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!getRes.ok) {
      throw new Error(`Gist fetch error: ${getRes.statusText}`);
    }

    const gist = await getRes.json();
    const fileContent = gist.files['accounts.json']?.content || '{}';
    const accounts = JSON.parse(fileContent);

    if (req.method === 'GET') {
      if (accounts[id]) {
        res.status(200).json(accounts[id]);
      } else {
        res.status(404).json({ error: 'Account non trovato' });
      }
    } else if (req.method === 'POST') {
      // Upsert dell'account
      accounts[id] = req.body;

      // 2. Aggiorna il Gist
      const patchRes = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: {
            'accounts.json': {
              content: JSON.stringify(accounts, null, 2),
            },
          },
        }),
      });

      if (!patchRes.ok) {
        throw new Error(`Gist patch error: ${patchRes.statusText}`);
      }

      res.status(200).json({ success: true });
    } else {
      res.status(405).json({ error: 'Metodo non consentito' });
    }
  } catch (error: any) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Errore interno del server database' });
  }
}
