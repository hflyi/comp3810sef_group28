const express = require('express');
const mongoose = require('mongoose');
const session = require('cookie-session');
const app = express();

const uri = 'mongodb://127.0.0.1:27017/promptblog';
mongoose.connect(uri)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log(err));

const userSchema = require('./models/User');
const promptSchema = require('./models/Prompt');
const User = mongoose.model('User', userSchema);
const Prompt = mongoose.model('Prompt', promptSchema);

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));

const SECRETKEY = 'Prompt Blog System';
app.use(session({
    name: 'session_key',
    keys: [SECRETKEY]
}));

function requireLogin(req, res, next) {
    if (!req.session.authenticated) {
        res.redirect('/login');
    } else {
        next();
    }
}

app.get('/', function(req, res) {
    if (!req.session.authenticated) {
        res.redirect('/login');
    } else {
        res.redirect('/prompts');
    }
});

app.get('/login', function(req, res) {
    res.status(200).render('login', {error: null});
});

app.post('/login', async function(req, res) {
    try {
        const user = await User.findOne({username: req.body.username});
        if (user && user.password == req.body.password) {
            req.session.authenticated = true;
            req.session.username = req.body.username;
            res.redirect('/prompts');

        } else {
            res.status(401).render('login', {error: 'Invalid username or password'});
        }

    } catch (err) {
        console.log(err);
        res.status(500).render('login', {
            error: 'Login failed'});
    }

});

app.get('/logout', function(req, res) {
    req.session = null;
    res.redirect('/login');

});

app.get('/prompts', requireLogin, async function(req, res) {
        try {
            const query = {};
            if (req.query.title) {
                query.title = {
                    $regex: req.query.title,
                    $options: 'i'
                };
            }

            if (req.query.category) {
                query.category = {
                    $regex: req.query.category,
                    $options: 'i'
                };
            }

            const prompts = await Prompt.find(query);
            res.status(200).render('prompts',
                {
                    prompts: prompts,
                    username: req.session.username,
                    searchTitle: req.query.title || '',
                    searchCategory: req.query.category || ''
                }
            );

        } catch (err) {
            console.log(err);
            res.status(500).send('Failed to load prompts');
        }
    }
);

app.get('/prompts/create', requireLogin, function(req, res) {
        res.status(200).render(
            'create',
            {}
        );
    }
);

app.post('/prompts/create', requireLogin, async function(req, res) {
        try {
            const newPrompt = new Prompt({
                title: req.body.title,
                content: req.body.content,
                category: req.body.category
            });

            await newPrompt.save();
            res.redirect('/prompts');

        } catch (err) {
            console.log(err);
            res.status(500).send('Failed to create prompt');
        }
    }
);

app.get('/prompts/update/:id', requireLogin, async function(req, res) {
        try {
            const prompt = await Prompt.findById(req.params.id);
            res.status(200).render(
                'update',
                {
                    prompt: prompt
                }
            );

        } catch (err) {
            console.log(err);
            res.status(500).send('Failed to load prompt');
        }
    }
);

app.post('/prompts/update/:id',requireLogin, async function(req, res) {

        try {
            await Prompt.findByIdAndUpdate(req.params.id,
                {
                    title: req.body.title,
                    content: req.body.content,
                    category: req.body.category
                }
            );
            res.redirect('/prompts');

        } catch (err) {
            console.log(err);
            res.status(500).send('Failed to update prompt');
        }
    }
);

app.post('/prompts/delete/:id', requireLogin, async function(req, res) {

        try {
            await Prompt.findByIdAndDelete(req.params.id);
            res.redirect('/prompts');

        } catch (err) {
            console.log(err);
            res.status(500).send('Failed to delete prompt');
        }
    }
);

app.get('/api/prompts', async function(req, res) {
        try {
            const query = {};
            if (req.query.title) {

                query.title = {
                    $regex: req.query.title,
                    $options: 'i'
                };
            }

            if (req.query.category) {
                query.category = {
                    $regex: req.query.category,
                    $options: 'i'
                };
            }

            const prompts = await Prompt.find(query);
            res.status(200).json(prompts);

        } catch (err) {
            console.log(err);
            res.status(500).json({error: 'Failed to load prompts'});
        }
    }
);

app.get('/api/prompts/:id', async function(req, res) {

        try {
            const prompt = await Prompt.findById(req.params.id);

            if (!prompt) {
                return res.status(404).json({error: 'Prompt not found'});
            }
            res.status(200).json(prompt);

        } catch (err) {
            console.log(err);
            res.status(500).json({error: 'Failed to load prompt'
            });

        }
    }
);

app.post('/api/prompts', async function(req, res) {

        try {
            const newPrompt = new Prompt({
                title: req.body.title,
                content: req.body.content,
                category: req.body.category

            });

            await newPrompt.save();
            res.status(201).json(newPrompt);

        } catch (err) {
            console.log(err);
            res.status(500).json({error: 'Failed to create prompt'});
        }
    }
);

app.put('/api/prompts/:id', async function(req, res) {

        try {
            const updatedPrompt = await Prompt.findByIdAndUpdate(req.params.id,
                    {
                        title: req.body.title,
                        content: req.body.content,
                        category: req.body.category
                    },
                    {
                        new: true
                    }
                );

            if (!updatedPrompt) {
                return res.status(404).json({error: 'Prompt not found'});

            }
            res.status(200).json(updatedPrompt);

        } catch (err) {
            console.log(err);
            res.status(500).json({error: 'Failed to update prompt'});
        }
    }
);

app.delete('/api/prompts/:id', async function(req, res) {

        try {
            const deletedPrompt =
                await Prompt.findByIdAndDelete(
                    req.params.id
                );

            if (!deletedPrompt) {
                return res.status(404).json({error: 'Prompt not found'});
            }
            res.status(200).json({message: 'Prompt deleted successfully'});

        } catch (err) {
            console.log(err);
            res.status(500).json({error: 'Failed to delete prompt'});
        }
    }
);

app.listen(process.env.PORT || 8099);
console.log('Prompt Blog System started');
