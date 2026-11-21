require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Prompt = require('./models/Prompt');

async function seed(){
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB successfully!");

    const user1 = await User.create({ username: "userA", password: "AAA" });
    const user2 = await User.create({ username: "userB", password: "BBB" });

    await Prompt.create([
        { 
            title: "Prompt 1", 
            content: "Create a 30-second generative-art short film. No narrative, no characters.",
            category:"Art",
            owner: user1._id
        },
        {
            title: "Prompt 2",
            content: "Turn this abstract math formula into an animation: e^(iπ) + 1 = 0 (Euler's identity).",
            category: "Math",
            owner: user2._id
        },
        {
        title: "Prompt 3",
        content: "Write a 200-word micro fiction: a lone lighthouse keeper receives a letter addressed to someone who died 50 years ago. Twist ending, melancholic tone.",
        category: "Writing",
        owner: user1._id
        },
        {
        title: "Prompt 4",
        content: "Design a minimal poster: bold sans-serif headline 'LESS', 90% negative space, single accent color, grid-based layout. Output layout specs and color codes.",
        category: "Design",
        owner: user1._id
        },
        {
        title: "Prompt 5",
        content: "Turn Newton's second law F = ma into an animation. Visualize a block on a frictionless surface.Clean motion graphics, glowing vectors on dark background.",
        category: "Physics",
        owner: user2._id
        }
    ]);

    console.log("Seed created done");
    mongoose.disconnect();
}

seed().catch(e=>console.error(e))