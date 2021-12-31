const Card: React.FC = ({ children }) => {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-4">
      {children}
    </div>
  );
};

export default Card;
