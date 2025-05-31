import PropTypes from "prop-types";

/**
 * Un componente de cargador personalizable con varios estilos y opciones.
 * @component
 * @param {Object} props - Las propiedades del componente.
 * @param {string} [props.text] - El texto a mostrar junto al loader, por defecto es "Cargando...".
 * @param {('circle'|'bars'|'dots'|'progress'|'spinner'|'text'|'blur'|'nailPaint')} [props.style='circle'] - El estilo del cargador, puede ser, `circle`, `bars`, `dots`, `progress`, `spinner`, `text`, `blur` o `nailPaint`.
 * @param {boolean} [props.fullScreen=false] - Si el cargador debe mostrarse a pantalla completa, por defecto es `false`.
 * @param {string} [props.background] - El color de fondo del cargador en modo pantalla completa o `fullScreen`, por defecto es `bg-white/70 dark:bg-neutral-800/95`.
 * @param {('sm'|'md'|'lg'|'xl')} [props.size='md'] - El tamaño del cargador, puede ser `sm`, `md`, `lg` o `xl`.
 * @param {boolean} [props.onlyIcon=false] - Si se debe mostrar solo el icono del cargador sin texto, por defecto es `false`.
 * @param {('horizontal'|'vertical')} [props.orientation='horizontal'] - La orientación del cargador y el texto, puede ser `horizontal` o `vertical`.
 * @param {number} [props.zIndex=100] - El z-index del cargador, por defecto es `100`.
 * @returns {React.Component} El componente CRLoader.
 *
 * @example
 *
 * <CRLoader text="Cargando..." style="nailPaint" fullScreen={false} background="bg-red-500" size="md" onlyIcon={false} orientation="vertical" zIndex={100} />
 *
 *_
 */
const CRLoader = ({
  text = "Cargando...",
  style = "circle",
  fullScreen = false,
  background = "bg-white/70 dark:bg-neutral-800/95",
  size = "md",
  onlyIcon = false,
  orientation = "vertical",
  zIndex = 100,
}) => {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  const iconSizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-6 h-6",
    xl: "w-8 h-8",
  };

  const iconSizeMaxClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-10 h-10",
  };

  const loaderStyleBlur = {
    height: "50px",
    aspectRatio: "2",
    border: "10px solid transparent",
    boxSizing: "border-box",
    background: `
      radial-gradient(farthest-side,#ffffff 98%,#0000) left/15px 15px,
      radial-gradient(farthest-side,#ffffff 98%,#0000) left/15px 15px,
      radial-gradient(farthest-side,#ffffff 98%,#0000) center/15px 15px,
      radial-gradient(farthest-side,#ffffff 98%,#0000) right/15px 15px,
      #0000004a
    `,
    backgroundRepeat: "no-repeat",
    filter: "blur(4px) contrast(10)",
    animation: "l14 1s infinite",
  };

  const smooth = "cubic-bezier(0.250, 0.540, 0.310, 0.995)";
  const smooth2 = "cubic-bezier(0.250, 0.460, 0.450, 0.940)";
  const smooth3 = "cubic-bezier(0.435, 0.715, 0.355, 0.595)";

  const animations = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes grow {
      0%, 100% { transform: scaleY(0.7); }
      50% { transform: scaleY(1.4); }
    }
    @keyframes waveText {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-3px); }
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    @keyframes oscillate {
      0% { transform: translateX(0); }
      100% { transform: translateX(300%); }
    }

    @keyframes dots1 {
        0%  {box-shadow: 20px 0 #838383, -20px 0 #7b7b7b6c;background: #838383 }
        33% {box-shadow: 20px 0 #838383, -20px 0 #7b7b7b6c;background: #7b7b7b6c}
        66% {box-shadow: 20px 0 #7b7b7b6c,-20px 0 #838383; background: #7b7b7b6c}
        100%{box-shadow: 20px 0 #7b7b7b6c,-20px 0 #838383; background: #838383 }
    }

    @keyframes l14 {
      100% {background-position:right,left,center,right}
    }

    /* New NailPaint Animations - ACCELERATED */
    @keyframes crNailFadeIn{
      from{ opacity: 0; }
      to{ opacity: 1; }
    }

    @keyframes crNailToXCenter{
      to{ transform: translateX(-50%) translateY(0); }
    }

    @keyframes crNailToFullHeight{
      to{ height: 100%; }
    }

    @keyframes crNailColours{
      0%{ background-color: #E91E63; }
      50%{ background-color: #9C27B0; }
      100%{ background-color: #2196F3; }
    }

    .cr-nail-icon{
      /* animation: crNailFadeIn 1.4s ${smooth} .8s 1 forwards; */
      animation: crNailFadeIn 0.7s ${smooth} 0.1s 1 forwards; /* Faster */
      background-color: rgba(0,0,0,.05);
      border-radius: 50%;
      height: 160px;
      width: 160px;
      opacity: 0;
      overflow: hidden;
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .cr-nail-icon__content{
      height: 100%;
      position: relative;
      width: 100%;
    }

    .cr-nail-icon__finger{
      /* animation: crNailToXCenter 2s ${smooth} 1.2s 1 forwards; */
      animation: crNailToXCenter 1s ${smooth} 0.3s 1 forwards; /* Faster */
      background-color: #FFCC80;
      border-radius: 50px 50px 0 0;
      bottom: 0;
      content: "";
      height: 136px;
      left: 50%;
      overflow: hidden;
      position: absolute;
      transform: translateX(-50%) translateY(150px);
      width: 95px;
      z-index: 1;
    }

    .cr-nail-icon__finger:before{
      background-color: rgba(0,0,0,.025);
      content: "";
      height: 100%;
      position: absolute;
      right: 0;
      width: 50%;
      z-index: -1;
    }
    .cr-nail-icon__finger:after{
      background-color: rgba(0,0,0,0.1);
      border-radius: 0 0 50px 50px;
      content: "";
      height: 70px;
      left: 15px;
      position: absolute;
      right: 15px;
      top: 0;
    }

    .cr-nail-icon__nail{
      /* animation: crNailToXCenter 2s ${smooth} 1.2s 1 forwards; */
      animation: crNailToXCenter 1s ${smooth} 0.3s 1 forwards; /* Faster */
      background-color: rgba(255,255,255,.8);
      border-radius: 20px 20px 50px 50px;
      bottom: 75px;
      content: "";
      height: 110px;
      left: 50%;
      overflow: hidden;
      position: absolute;
      transform: translateX(-50%) translateY(150px);
      width: 60px;
      z-index: 2;
    }

    .cr-nail-icon__nail:before{ /* Base coat */
      /* animation: crNailToFullHeight 1.6s ${smooth2} 2.2s 1 forwards; */
      animation: crNailToFullHeight 0.8s ${smooth2} 0.8s 1 forwards; /* Faster, starts after finger/nail appear */
      background-color: #FFFFFF;
      border-radius: 0 0 50px 50px;
      bottom: 0;
      content: "";
      height: 0%;
      position: absolute;
      width: 100%;
      z-index: 3;
    }
    .cr-nail-icon__nail:after{ /* Color coat */
      /* animation: crNailToFullHeight 1.4s ${smooth} 3.6s 1 forwards, crNailColours 4s ${smooth} 3.6s infinite alternate; */
      animation: crNailToFullHeight 0.7s ${smooth} 1.3s 1 forwards, crNailColours 2.5s ${smooth} 1.3s infinite alternate; /* Faster fill, faster loop, starts after base coat */
      background-color: #F50057;
      border-radius: 0 0 50px 50px;
      bottom: 0;
      content: "";
      height: 0%;
      position: absolute;
      width: 100%;
      z-index: 3;
    }

    .cr-nail-gloss{
      border-radius: 0 0 20px;
      bottom: 12px;
      height: 100px;
      overflow: hidden;
      position: absolute;
      right: 10px;
      width: 26px;
      z-index: 4;
    }

    .cr-nail-gloss:before{
      /* animation: crNailToFullHeight 1.2s ${smooth3} 4.6s 1 forwards; */
      animation: crNailToFullHeight 0.6s ${smooth3} 1.8s 1 forwards; /* Faster, starts after color fill */
      background-color: rgba(255,255,255,.5);
      bottom: 0;
      content: "";
      height: 0%;
      position: absolute;
      right: 0;
      width: 50%;
    }
  `;

  const getLoaderContent = () => {
    switch (style) {
      case "circle":
        return (
          <div
            className={`${iconSizeMaxClasses[size]} rounded-full border-4 border-gray-200 border-t-neutral-500 dark:border-gray-700 dark:border-t-neutral-300`}
            style={{ animation: "spin 1s linear infinite" }}
          ></div>
        );
      case "bars":
        return (
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`${iconSizeClasses[size]} bg-neutral-500 dark:bg-neutral-300`}
                style={{ animation: "grow 1s ease-in-out infinite", animationDelay: `${i * 0.1}s` }}
              ></div>
            ))}
          </div>
        );
      case "dots":
        return (
          <div
            style={{
              width: "15px",
              aspectRatio: "1",
              borderRadius: "50%",
              animation: "dots1 1s infinite linear alternate",
            }}
          ></div>
        );
      case "progress":
        return (
          <div className={`${iconSizeClasses[size]} w-[200px] bg-gray-300 rounded-full dark:bg-gray-700`}>
            <div
              className="h-full bg-neutral-500 rounded-full dark:bg-neutral-300"
              style={{ width: "50px", animation: "oscillate 1.5s ease-in-out infinite alternate" }}
            ></div>
          </div>
        );
      case "spinner":
        return (
          <div
            className={`${iconSizeMaxClasses[size]} rounded-full border-[15px] border-neutral-500 border-r-transparent dark:border-r-transparent dark:border-neutral-300`}
            style={{ animation: "spin 1s linear infinite" }}
          ></div>
        );
      case "text":
        return (
          <div className="flex text-black dark:text-white scale-125 font-bold">
            {text.split("").map((char, i) => (
              <span key={i} style={{ animation: "waveText 1.5s ease-in-out infinite", animationDelay: `${i * 0.1}s` }}>
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </div>
        );
      case "blur":
        return <div style={loaderStyleBlur}></div>;
      case "nailPaint":
        return (
          <div className="cr-nail-icon">
            <div className="cr-nail-icon__content">
              <div className="cr-nail-icon__nail">
                <div className="cr-nail-gloss"></div>
              </div>
              <div className="cr-nail-icon__finger"></div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const containerClasses = `
    flex justify-center items-center
    ${fullScreen ? "fixed top-0 left-0 w-full h-full" : "relative"}
    ${fullScreen && background ? background : ""}
    ${sizeClasses[size]}
    ${orientation === "horizontal" ? "flex-row space-x-2 items-center" : "flex-col space-y-2 items-center"}
  `;

  return (
    <div className={containerClasses.trim()} style={{ zIndex }}>
      {getLoaderContent()}
      {!onlyIcon && style !== "text" && <span className={`text-black dark:text-white ${sizeClasses[size]}`}>{text}</span>}
      <style>{animations}</style>
    </div>
  );
};

CRLoader.propTypes = {
  text: PropTypes.string,
  style: PropTypes.oneOf(["circle", "bars", "dots", "progress", "spinner", "text", "blur", "nailPaint"]),
  fullScreen: PropTypes.bool,
  background: PropTypes.string,
  size: PropTypes.oneOf(["sm", "md", "lg", "xl"]),
  onlyIcon: PropTypes.bool,
  orientation: PropTypes.oneOf(["horizontal", "vertical"]),
  zIndex: PropTypes.number,
};

export default CRLoader;
