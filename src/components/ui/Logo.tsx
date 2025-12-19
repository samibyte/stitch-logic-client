import stitchLogo from "/stitchLogo.png";
const Logo = ({ width = 60, height = 30 }) => {
  return (
    <div className={`relative h-${height} w-${width} border-2`}>
      <img className="w-40 border-2" src={stitchLogo}></img>
      <p className="absolute right-0 text-5xl font-black text-[#090909]/90">
        Logic
      </p>
    </div>
  );
};

export default Logo;
