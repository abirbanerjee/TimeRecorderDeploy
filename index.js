import express from "express";
import cors from "cors";
import cookies from "cookie-parser";
import sessions from "express-session";
import {
  createCompany,
  createRecord,
  deleteRec,
  fetchAllRecords,
  GetCompanyWiseReport,
  getMonthlyRecording,
  getProjects,
  validateUser,
} from "./database.js";
const app = express();

app.use(cookies());
app.use(express.json());
app.use(cors());
app.use(express.static("build"));
app.use(
  sessions({
    secret: process.env.JSON_WEB_SECRET,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
      httpOnly: false,
    },
    resave: true,
    saveUninitialized: false,
  })
);
app.listen(process.env.PORT, () => {
  console.log("http://localhost:" + process.env.PORT);
});

app.post("/createcompany", async (req, res) => {
  const { company, project } = req.body;
  const reply = await createCompany(company, project);
  res.send(reply);
});

app.post("/createrecord", async (req, res) => {
  const { company, project, date, hours } = req.body;
  const reply = createRecord(company, project, date, hours, req.session.userid);
  return res.send({ status: "success" });
});

app.get("/getprojects", async (req, res) => {
  const formattedProjects = {};
  const projects = await getProjects();
  projects.forEach((project) => {
    if (formattedProjects[`${project.companyName}`]) {
      formattedProjects[`${project.companyName}`].push(
        `${project.projectName}`
      );
    } else {
      formattedProjects[`${project.companyName}`] = [`${project.projectName}`];
    }
  });
  return res.send(formattedProjects);
});

app.get("/getcompanyreport/:company", async (req, res) => {
  let recordings = await GetCompanyWiseReport(
    req.params.company,
    req.session.userid
  );
  return res.send(recordings);
});

app.get("/getmonthlyreport/:month", async (req, res) => {
  let recordings = await getMonthlyRecording(
    req.params.month,
    req.session.userid
  );
  return res.send(recordings);
});

app.get("/allrecords", async (req, res) => {
  return res.send(await fetchAllRecords(req.session.userid));
});

app.post("/deleterec", SessionCheck, async (req, res) => {
  const { selectedIndices } = req.body;
  return res.send(await deleteRec(selectedIndices));
});

app.post("/login", SessionCheck, (req, res) => {
  return res.send({ status: 1 });
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  return res.send({ status: 0 });
});

async function SessionCheck(req, res, next) {
  const { username, password } = req.body;
  if (req.session.userid) {
    next();
  } else if (await loginCheck(username, password)) {
    req.session.userid = username;
    next();
  } else {
    return res.send({ status: 0 });
  }
}

async function loginCheck(username, password) {
  return await validateUser(username, password);
}
