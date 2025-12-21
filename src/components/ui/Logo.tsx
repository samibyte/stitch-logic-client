import stitchLogo from "/stitchLogo.png";
const Logo = () => {
  return (
    <div className={`relative h-30 w-60 border-2`}>
      <img className="w-40 border-2" src={stitchLogo}></img>
      <p className="absolute right-0 text-5xl font-black text-[#090909]/90">
        Logic
      </p>
    </div>
  );
};

export default Logo;
