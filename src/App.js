import "./styles.css";
import Table from "./components/Table";

export default function App() {
  const data = [
    ["name", "gender", "status", "city", "score"],
    ["Rajesh", "male", "pass", "Bangalore", 30],
    ["Neelam", "female", "fail", "Delhi", 20],
    ["Krishna", "male", "fail", "Mumbai", 22],
    ["Shanti", "female", "pass", "Pune", 45],
    ["Krish", "male", "pass", "Bangalore", 30],
    ["Sonal", "female", "fail", "Delhi", 20],
    ["Shikhar", "male", "fail", "Mumbai", 23],
    ["Riya", "female", "pass", "Pune", 41]
  ];

  const headers = data.shift();
  const rows = data;
  return <Table headers={headers} rows={rows} />;
}
