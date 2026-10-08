import fs from 'fs';
import path from 'path';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const rawId = req.query.id as string;
  if (!rawId) {
    res.status(400).json({ error: 'ID account mancante' });
    return;
  }

  const GIST_ID = 'ca1bee040d283afc5013b65e7ecc2725';
  const TOKEN = process.env.GITHUB_TOKEN;

  // Carica prima il fallback locale da accounts.json
  let accounts: Record<string, any> = {};
  try {
    const p = path.join(process.cwd(), 'accounts.json');
    if (fs.existsSync(p)) {
      accounts = JSON.parse(fs.readFileSync(p, 'utf8'));
    }
  } catch (e) {
    console.warn('Errore lettura fallback accounts.json:', e);
  }

  // Se TOKEN è disponibile, tenta di recuperare l'ultimo stato dal Gist
  if (TOKEN) {
    try {
      const getRes = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (getRes.ok) {
        const gist = await getRes.json();
        const fileContent = gist.files?.['accounts.json']?.content;
        if (fileContent) {
          accounts = { ...accounts, ...JSON.parse(fileContent) };
        }
      }
    } catch (gistErr) {
      console.warn('Avviso recupero Gist, uso fallback:', gistErr);
    }
  }

  if (req.method === 'GET') {
    // 1. Ricerca diretta per chiave (es. acc_f3c26e64b22940992919e88bcb5a88cd)
    if (accounts[rawId]) {
      res.status(200).json(accounts[rawId]);
      return;
    }

    // 2. Ricerca per email o username (es. "odglivio", "pedrinilivio@gmail.com")
    const search = rawId.toLowerCase().trim();
    const found = Object.values(accounts).find((acc: any) => {
      const accEmail = (acc.email || '').toLowerCase().trim();
      const accNome = (acc.nome || '').toLowerCase().trim();
      if (accEmail === search) return true;
      if (search === 'odglivio' && (accEmail === 'pedrinilivio@gmail.com' || accNome.includes('livio'))) return true;
      if (search === 'livio' || search === 'livped72') return true;
      return false;
    });

    if (found) {
      res.status(200).json(found);
      return;
    }

    res.status(404).json({ error: 'Account non trovato' });
    return;
  }

  if (req.method === 'POST') {
    accounts[rawId] = req.body;

    // Se TOKEN è disponibile, aggiorna il Gist
    if (TOKEN) {
      try {
        await fetch(`https://api.github.com/gists/${GIST_ID}`, {
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
      } catch (patchErr) {
        console.warn('Errore aggiornamento Gist:', patchErr);
      }
    }

    res.status(200).json({ success: true });
    return;
  }

  res.status(405).json({ error: 'Metodo non consentito' });
}
