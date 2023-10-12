// <-------- Main Application File for the E-Portal Project ------------------------------------------------>
console.log("hello world"); // v2 v2ersion
// Declare loggedInJudgeUsername as a global variable
let loggedInJudgeUsername = '';
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/user'); // Import the User model
const Case = require('./models/case'); // Import the Case model

// <-------- Cloud Database Connection ----------------------------------------------------------->
mongoose.connect('mongodb+srv://pratham5685:EhqAijLm4sGUY4q6@e-portal.qpvxdka.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});



// <-------- Middleware and View Engine  --------------------------------------------------------------------->
// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true })); // Parse POST request data

// Set the views directory and HTML as the view engine
app.set('views', __dirname + '/views/html');
app.engine('html', require('ejs').renderFile); // Use EJS to render HTML
app.set('view engine', 'html');




// <-------- Authentication Routes with Access Control ----------------------------------------------------------->

// Registration route
app.get('/register', (req, res) => {
  res.render('register.html');
});

app.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({ username, password: hashedPassword, role });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Login route
app.get('/login', (req, res) => {
  res.render('login.html');
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Verify credentials and retrieve user data from the database
    const user = await User.findOne({ username });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    switch (user.role) {
      case 'Court Staff':
        res.redirect('/court-staff-dashboard');
        break;
      case 'Parties Involved':
        res.redirect('/parties-involved-dashboard');
        break;
      case 'Lawyer':
        res.redirect('/lawyer-dashboard');
        break;
      case 'Judge':
        res.redirect(`/judge-dashboard?judge=${username}`);
        break;
      default:
        res.status(403).json({ message: 'Access denied' });
        break;
    }
    
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Login failed' });
  }
});






// <-------- Dashboard Routes ------------------------------------------------>


//<------------Court Staff Dashboard-------------------------------------------------->

app.get('/court-staff-dashboard', async (req, res) => {
  try {
    // Fetch the list of cases from the database (You'll need to implement this)
    const cases = await Case.find(); // Replace with your own query to fetch cases

    // Fetch the list of users with role "Judge" or "Lawyer" from the database
    const judgesAndLawyers = await User.find({ role: { $in: ['Judge', 'Lawyer'] } });

    // Render the court-staff-dashboard.html page and pass both the cases and users data to it
    res.render('court-staff-dashboard.html', { cases, judgesAndLawyers });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error fetching data' });
  }
});




app.post('/create-case', async (req, res) => {
  try {
    // Extract case data from the form
    const {
      caseNumber,
      partiesInvolved,
      caseType,
      caseStatus,
      hearingDates,
      caseDescription,
      caseDocuments,
      assignedJudge,
      caseHistory,
      assignedLawyer,

    } = req.body;

    // Create a new Case document
    const newCase = new Case({
      caseNumber,
      partiesInvolved: partiesInvolved.split(',').map((party) => party.trim()),
      caseType,
      caseStatus,
      hearingDates: hearingDates.split(',').map((date) => new Date(date.trim())),
      caseDescription,
      caseDocuments: caseDocuments
        .split(',')
        .map((doc) => {
          const [title, link] = doc.trim().split('|');
          return { title, link };
        }),
      assignedJudge,
      caseHistory: caseHistory
        .split(',')
        .map((event) => {
          const [timestamp, eventDesc] = event.trim().split('|');
          return { timestamp: new Date(timestamp), event: eventDesc };
        }),
      assignedLawyer,
    });

    // Save the new case to the database
    await newCase.save();

    // Redirect back to the Court Staff Dashboard after case creation
    res.redirect('/court-staff-dashboard');


    
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Case creation failed' });
  }
});




//------------Judge  Dashboard------------------------------------------------------------>
app.get('/judge-dashboard', async (req, res) => {
  try {
    const loggedInJudgeUsername = req.query.judge; // Retrieve judge's username from query parameter
    const cases = await Case.find({ assignedJudge: loggedInJudgeUsername });
    res.render('judge-dashboard.html', { cases });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching data' });
  }
});



app.post('/update-case', async (req, res) => {
  try {
    const { caseId, hearingDate, caseStatus } = req.body;

    // Update the case in the database with the new hearing date and case status
    await Case.findByIdAndUpdate(
      caseId,
      { $set: { hearingDate, caseStatus } },
      { new: true }
    );

    // Fetch the updated cases for the judge
    const loggedInJudgeUsername = req.query.judge;
    const updatedCases = await Case.find({ assignedJudge: loggedInJudgeUsername });

    // Render the judge-dashboard.html template with the updated cases
    res.render('judge-dashboard.html', { cases: updatedCases });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error updating case' });
  }
});






















app.get('/lawyer-dashboard', (req,res)=>{
  res.send('welcome to Lawyer Dashboard');
});



app.get('/parties-involved-dashboard', (req,res)=>{
  res.send('welcome to parties involved dashboard');
});







// <-------------------------- Initial Starter Code for the E-Portal Project ------------------------------------>

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
// <-------- Home Page ------------------------------------------------>
app.get("/", (req, res) => {
  res.render("index.html");
});

