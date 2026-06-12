(function(){

const BLOCK_URL = "https://www.cricfoot.net/";

// allow localhost for development
if(location.origin === "https://yonotv-now.pages.dev") return;

// allow Google AMP embeds
try{
    const origins = window.location.ancestorOrigins;
    if(origins && origins.length){
        const parent = origins[origins.length-1];
        if(parent.includes("www.cricfoot.net")) return;
    }
}catch(e){}

// must be inside iframe
if(window.self === window.top){
    location.replace(BLOCK_URL);
    return;
}

// check parent domain
try{
    const ref = document.referrer;
    if(!ref){
        location.replace(BLOCK_URL);
        return;
    }

    const domain = new URL(ref).hostname;

    const allowed = [
        "s1.hls-player.net",
        "redirects.pages.dev"
    ];

    const ok = allowed.some(d => domain.includes(d));

    if(!ok){
        location.replace(BLOCK_URL);
        return;
    }

}catch(e){
    location.replace(BLOCK_URL);
}


})();
