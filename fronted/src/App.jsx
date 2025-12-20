import api from "./api/axios";

function App() {
  const testBackend = async () => {
    try {
      const res = await api.get("/health"); // or any test route
      console.log(res.data);
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  return (
    <div>
      <h1>YouTube Clone Frontend</h1>
      <button onClick={testBackend}>Test Backend</button>
    </div>
  );
}

export default App;
