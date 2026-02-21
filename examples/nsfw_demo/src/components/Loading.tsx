import "../styles/sk-cube-grid.css";

const Loading = () => {
  return (
    <div className="sk-cube-grid">
      {[...Array(9)].map((_, i) => (
        <div key={i} className={`sk-cube sk-cube${i + 1}`} />
      ))}
    </div>
  );
};

export default Loading;
