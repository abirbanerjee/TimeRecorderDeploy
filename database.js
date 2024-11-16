import { MongoClient, ObjectId } from "mongodb";
import "dotenv/config";

const client = new MongoClient(process.env.connectionString);
const db = client.db("TimeRecorder");

const ProjectCollection = db.collection("projects");
const recordingsCollection = db.collection("recordings");

export async function createCompany(companyName, projectName) {
  const recid = await ProjectCollection.insertOne({ companyName, projectName });
  return recid;
}
export async function createRecord(company, project, date, hours) {
  const companyRec = await ProjectCollection.findOne({
    companyName: company,
    projectName: project,
  });
  const CompanyId = companyRec._id;
  const recid = await recordingsCollection.insertOne({
    CompanyId,
    date,
    hours,
  });
  return recid;
}

export async function getProjects() {
  const projects = await ProjectCollection.find().toArray();
  projects.forEach((project) => {
    delete project._id;
  });
  return projects;
}

export async function delProjects() {
  const res = await ProjectCollection.deleteMany({
    $nor: [{ companyName: "Gramont" }, { companyName: "Agrana" }],
  });
}

export async function GetCompanyWiseReport(companyName) {
  let recordings = [];
  const projectids = await ProjectCollection.find({ companyName }).toArray();
  for (let i = 0; i < projectids.length; i++) {
    const recording = await recordingsCollection
      .find({ CompanyId: projectids[i]._id })
      .toArray();
    recording.forEach((record) => {
      delete record._id;
      delete record.CompanyId;
      record.company = projectids[i].companyName;
      record.project = projectids[i].projectName;
      recordings.push(record);
    });
  }
  return recordings;
}

export async function getMonthlyRecording(month) {
  let recordings = {};
  const regex = new RegExp(`^${month}`);
  const records = await recordingsCollection
    .find({ date: regex })
    .project({ _id: 0 })
    .toArray();
  for (let i = 0; i < records.length; i++) {
    const companyProject = await ProjectCollection.findOne({
      _id: records[i].CompanyId,
    });
    delete records[i].CompanyId;
    records[
      i
    ].company = `${companyProject.companyName} - ${companyProject.projectName}`;
    if (recordings[records[i].company]) {
      recordings[records[i].company] += parseInt(records[i].hours);
    } else {
      recordings[records[i].company] = parseInt(records[i].hours);
    }
  }
  return recordings;
}

export async function fetchAllRecords() {
  const records = await recordingsCollection.find({}).toArray();
  for (let i = 0; i < records.length; i++) {
    const companyProject = await ProjectCollection.findOne({
      _id: records[i].CompanyId,
    });
    delete records[i].CompanyId;
    records[
      i
    ].company = `${companyProject.companyName} - ${companyProject.projectName}`;
  }
  return records;
}
export async function deleteRec(ids) {
  let results = [];

  for (let i = 0; i < ids.length; i++) {
    const _id = new ObjectId(ids[i]);
    const rep = await recordingsCollection.deleteOne({ _id });
    results.push(rep);
  }
  return results;
}