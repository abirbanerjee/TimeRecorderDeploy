import express from "express";
import cors from "cors";
import {
  createCompany,
  createRecord,
  deleteRec,
  fetchAllRecords,
  GetCompanyWiseReport,
  getMonthlyRecording,
  getProjects,
} from "./database.js";
const app = express();
app.use(express.json());
// app.use(cors());
app.use(express.static("build"));
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
  const reply = createRecord(company, project, date, hours);
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
  let recordings = await GetCompanyWiseReport(req.params.company);
  return res.send(recordings);
});

app.get("/getmonthlyreport/:month", async (req, res) => {
  let recordings = await getMonthlyRecording(req.params.month);
  return res.send(recordings);
});

app.get("/allrecords", async (req, res) => {
  return res.send(await fetchAllRecords());
});

app.post("/deleterec", async (req, res) => {
  console.log(req.body);
  const { selectedIndices } = req.body;
  return res.send(await deleteRec(selectedIndices));
});
