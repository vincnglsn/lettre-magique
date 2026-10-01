export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

    const { cv, job } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY; 

    if (!API_KEY) return res.status(500).json({ error: "Configuration manquante côté serveur." });

    const prompt = `Agis comme un expert en recrutement. Rédige une lettre de motivation convaincante et professionnelle. Utilise le vouvoiement. 
    Voici le CV : ${cv}. 
    Voici l'offre : ${job}.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();
        
        if (!response.ok) {
            // Si Google est surchargé, on donne un message poli à TON utilisateur
            if (data.error?.message?.includes("high demand") || data.error?.code === 503) {
                return res.status(503).json({ error: "L'Intelligence Artificielle est très sollicitée en ce moment. Attendez quelques secondes et réessayez !" });
            }
            return res.status(500).json({ error: "Le service IA est temporairement indisponible." });
        }

        const letter = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ letter });
    } catch (error) {
        return res.status(500).json({ error: "Problème de connexion, veuillez réessayer." });
    }
}
