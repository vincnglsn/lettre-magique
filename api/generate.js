export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    const { cv, job } = req.body;
    
    // C'est ICI que Vercel viendra injecter ta clé secrète de façon invisible !
    const API_KEY = process.env.GEMINI_API_KEY; 

    const prompt = `Agis comme un expert en recrutement. Rédige une lettre de motivation convaincante et professionnelle. Utilise le vouvoiement. 
    Voici le CV du candidat : ${cv}. 
    Voici l'offre d'emploi : ${job}.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        const letter = data.candidates[0].content.parts[0].text;
        
        return res.status(200).json({ letter });
    } catch (error) {
        return res.status(500).json({ error: 'Erreur du serveur IA' });
    }
}
