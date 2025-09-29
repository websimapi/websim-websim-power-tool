import{j as e}from\"./jsx-runtime-CAOzMBF_.js\";import{u as n,a as i,H as m,B as p,F as d}from\"./site-BvSOFej0.js\";import{H as a}from\"./homepage-BNOGCkWt.js\";import{u as c}from\"./components-DuZHB1vv.js\";
import PowerTool from "power-tool";
import { useState, useEffect } from "react";
//...existing content...
function W(){const{dehydratedState:t}=c()??{},{project:r}=n(),s=!i();
    
    const [isToolActive, setIsToolActive] = useState(false);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tool = urlParams.get('tool');
        const isTool = tool === 'color-palette';
        setIsToolActive(isTool);
        document.title = isTool ? "Websim Color Palette Power Tool" : "Websim";
    }, [window.location.search]); 

    if (isToolActive) {
        return e.jsx(m, { 
            state: t,
            children: e.jsx(PowerTool, {})
        });
    }

    return e.jsx(m,{state:t,children:r?e.jsx(p,{renderBottomBar:()=>e.jsx(d,{})}):s?e.jsx(a,{}):e.jsx(a,{})})}
export{u as clientLoader,W as default,L as meta,v as shouldRevalidate};

