const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const QUESTIONS_FILE = path.join(__dirname, 'questions.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize questions file if it doesn't exist
async function initializeQuestionsFile() {
    try {
        await fs.access(QUESTIONS_FILE);
    } catch {
        const defaultQuestions = [
            {
                id: 1,
                title: "Beam Deflection Analysis",
                category: "Mechanical",
                difficulty: "Medium",
                description: "A simply supported beam of length 10m carries a uniformly distributed load of 5 kN/m. The beam has a Young's modulus of 200 GPa and a moment of inertia of 8.5×10⁻⁶ m⁴.",
                question: "Calculate the maximum deflection of the beam in millimeters.",
                givenInfo: [
                    "Length (L) = 10 m",
                    "Load (w) = 5 kN/m = 5000 N/m",
                    "Young's Modulus (E) = 200 GPa = 200×10⁹ Pa",
                    "Moment of Inertia (I) = 8.5×10⁻⁶ m⁴"
                ],
                formula: "δ_max = (5wL⁴)/(384EI)",
                answer: "15.28",
                unit: "mm",
                tolerance: 0.5,
                completed: false
            },
            {
                id: 2,
                title: "Rocket Thrust Calculation",
                category: "Aerospace",
                difficulty: "Hard",
                description: "A rocket engine expels exhaust gases at a velocity of 3000 m/s relative to the rocket. The mass flow rate of the exhaust is 150 kg/s.",
                question: "Calculate the thrust produced by the rocket engine in kilonewtons (kN).",
                givenInfo: [
                    "Exhaust velocity (v_e) = 3000 m/s",
                    "Mass flow rate (ṁ) = 150 kg/s"
                ],
                formula: "F = ṁ × v_e",
                answer: "450",
                unit: "kN",
                tolerance: 1,
                completed: false
            },
            {
                id: 3,
                title: "Heat Transfer Through Wall",
                category: "Thermodynamics",
                difficulty: "Easy",
                description: "A brick wall 0.3m thick has an area of 20m². The temperature on one side is 80°C and on the other side is 20°C. The thermal conductivity of brick is 0.7 W/(m·K).",
                question: "Calculate the rate of heat transfer through the wall in kilowatts (kW).",
                givenInfo: [
                    "Thickness (L) = 0.3 m",
                    "Area (A) = 20 m²",
                    "Temperature difference (ΔT) = 80 - 20 = 60°C",
                    "Thermal conductivity (k) = 0.7 W/(m·K)"
                ],
                formula: "Q = (k × A × ΔT) / L",
                answer: "2.8",
                unit: "kW",
                tolerance: 0.1,
                completed: false
            },
            {
                id: 4,
                title: "Spring Constant Calculation",
                category: "Mechanical",
                difficulty: "Easy",
                description: "A spring is compressed by 0.15m when a force of 450N is applied to it.",
                question: "Calculate the spring constant in N/m.",
                givenInfo: [
                    "Force (F) = 450 N",
                    "Displacement (x) = 0.15 m"
                ],
                formula: "k = F / x",
                answer: "3000",
                unit: "N/m",
                tolerance: 10,
                completed: false
            },
            {
                id: 5,
                title: "Pressure in Fluid Column",
                category: "Fluid Mechanics",
                difficulty: "Medium",
                description: "A vertical column of water has a height of 25m. Calculate the pressure at the bottom of the column due to the water alone (not including atmospheric pressure). Density of water is 1000 kg/m³ and g = 9.81 m/s².",
                question: "Calculate the pressure in kilopascals (kPa).",
                givenInfo: [
                    "Height (h) = 25 m",
                    "Density (ρ) = 1000 kg/m³",
                    "Gravity (g) = 9.81 m/s²"
                ],
                formula: "P = ρ × g × h",
                answer: "245.25",
                unit: "kPa",
                tolerance: 1,
                completed: false
            }
        ];
        await fs.writeFile(QUESTIONS_FILE, JSON.stringify(defaultQuestions, null, 2));
        console.log('Created default questions.json file');
    }
}

// Get all questions
app.get('/api/questions', async (req, res) => {
    try {
        const data = await fs.readFile(QUESTIONS_FILE, 'utf8');
        const questions = JSON.parse(data);
        res.json(questions);
    } catch (error) {
        console.error('Error reading questions:', error);
        res.status(500).json({ error: 'Failed to load questions' });
    }
});

// Add a new question
app.post('/api/questions', async (req, res) => {
    try {
        const data = await fs.readFile(QUESTIONS_FILE, 'utf8');
        const questions = JSON.parse(data);
        
        const newQuestion = {
            ...req.body,
            id: Math.max(...questions.map(q => q.id), 0) + 1,
            completed: false
        };
        
        questions.push(newQuestion);
        await fs.writeFile(QUESTIONS_FILE, JSON.stringify(questions, null, 2));
        
        res.json(newQuestion);
    } catch (error) {
        console.error('Error adding question:', error);
        res.status(500).json({ error: 'Failed to add question' });
    }
});

// Update a question (mark as completed)
app.put('/api/questions/:id', async (req, res) => {
    try {
        const questionId = parseInt(req.params.id);
        const data = await fs.readFile(QUESTIONS_FILE, 'utf8');
        const questions = JSON.parse(data);
        
        const updatedQuestions = questions.map(q => 
            q.id === questionId ? { ...q, ...req.body } : q
        );
        
        await fs.writeFile(QUESTIONS_FILE, JSON.stringify(updatedQuestions, null, 2));
        
        const updatedQuestion = updatedQuestions.find(q => q.id === questionId);
        res.json(updatedQuestion);
    } catch (error) {
        console.error('Error updating question:', error);
        res.status(500).json({ error: 'Failed to update question' });
    }
});

// Delete a question
app.delete('/api/questions/:id', async (req, res) => {
    try {
        const questionId = parseInt(req.params.id);
        const data = await fs.readFile(QUESTIONS_FILE, 'utf8');
        const questions = JSON.parse(data);
        
        const filteredQuestions = questions.filter(q => q.id !== questionId);
        await fs.writeFile(QUESTIONS_FILE, JSON.stringify(filteredQuestions, null, 2));
        
        res.json({ success: true, id: questionId });
    } catch (error) {
        console.error('Error deleting question:', error);
        res.status(500).json({ error: 'Failed to delete question' });
    }
});

// Check answer
app.post('/api/check', async (req, res) => {
    try {
        const { questionId, userAnswer } = req.body;
        const data = await fs.readFile(QUESTIONS_FILE, 'utf8');
        const questions = JSON.parse(data);
        const question = questions.find(q => q.id === questionId);
        
        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }
        
        const numAnswer = parseFloat(userAnswer);
        const correctAnswer = parseFloat(question.answer);
        const tolerance = question.tolerance || 0.01;
        
        const isCorrect = Math.abs(numAnswer - correctAnswer) <= tolerance;
        
        res.json({
            correct: isCorrect,
            message: isCorrect 
                ? `Correct! The answer is ${correctAnswer} ${question.unit}.`
                : `Incorrect. Your answer: ${numAnswer} ${question.unit}. Correct answer: ${correctAnswer} ${question.unit}.`,
            correctAnswer: correctAnswer,
            yourAnswer: numAnswer
        });
    } catch (error) {
        console.error('Error checking answer:', error);
        res.status(500).json({ error: 'Failed to check answer' });
    }
});

// Start server
initializeQuestionsFile().then(() => {
    app.listen(PORT, () => {
        console.log(`EngineerPrep server running on http://localhost:${PORT}`);
        console.log(`Frontend available at http://localhost:${PORT}`);
    });
});
