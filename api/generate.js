export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

    const { cv, job } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY; 

    // Test n°1 : Est-ce que Vercel trouve bien la clé ?
    if (!API_KEY) {
        return res.status(500).json({ error: "Vercel ne trouve pas la clé GEMINI_API_KEY." });
    }

    const prompt = `Agis comme un expert en recrutement. Rédige une lettre de motivation convaincante et professionnelle. Utilise le vouvoiement. 
    Voici le CV : ${cv}. 
    Voici l'offre : ${job}.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();
        
        // Test n°2 : Est-ce que Google refuse la clé ?
        if (!response.ok) {
            return res.status(500).json({ error: "Google refuse : " + (data.error?.message || "Erreur inconnue") });
        }

        const letter = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ letter });
    } catch (error) {
        // Test n°3 : Y a-t-il un crash de code ?
        return res.status(500).json({ error: "Crash du code : " + error.message });
    }
}
