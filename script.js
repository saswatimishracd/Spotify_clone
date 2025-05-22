let currentSong = new Audio();
let currFolder;
let songs;
let currentSongIdx = 0;
const volume = document.querySelector(".volume");
const volumeSlider = document.querySelector('.volume-slider');

async function displayAlbums(){
    let a = await fetch(`http://127.0.0.1:5500/songs/`);
    let response = await a.text();
    // console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors);
    array.forEach(async e=>{
       if(e.href.includes("/songs/")){
       let folder = e.href.split("/")[4];
       //Get the metadata
       let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
       let response = await a.json();
       //Add the data tp the cardContainer
       let cardContainer = document.querySelector(".cardContainer");
       let card = document.createElement("div");
       card.innerHTML=`<div class="card" data-folder="${folder}">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
                                color="#000000" fill="black">
                                <path
                                    d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                                    stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpeg" alt="happy songs">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        cardContainer.appendChild(card);
            //Getting songs from the CARD
    Array.from(document.getElementsByClassName("card")).forEach((e)=>{
        e.addEventListener("click",async item=>{
          
            songs = await getSongs(`${item.currentTarget.dataset.folder}`);
            currentSongIdx = 0;
            playMusic(songs[currentSongIdx]);
        })
    })
       };
    })
   
}


async function getSongs(folder) {
   currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/songs/${currFolder}/`);
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
     songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`${currFolder}/`)[1]);
        }
    }
    
        let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
        songUL.innerHTML=""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>   <img  class="invert" src="music.svg" alt="">
        <div class="info">
            <div>${(song || "").split("/").pop().replaceAll("%20", " ")}</div>
            <div>${"Sushree"}</div> 
        </div>
        <div class="playNow">
            <span>Play Now</span>
            <img class="invert" src="play.svg" alt="">
        </div></li>`;
    }
    //event listener for song List
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML);
        })
    })
return songs;
    
}

function muteMusic(e){
    if(e.target.src.includes("volume.svg")){
       e.target.src = e.target.src.replace( "volume.svg","mute.svg")
        currentSong.volume = 0;
        volumeSlider.value = 0;
    }
    else{
        e.target.src =  e.target.src.replace( "mute.svg","volume.svg")
        currentSong.volume = 1;
        volumeSlider.value = 1;    
    }
}

function secondsToMinutesFormat(seconds) {
    let mins = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);

    // Pad with leading zero if needed
    let paddedMins = mins.toString().padStart(2, "0");
    let paddedSecs = secs.toString().padStart(2, "0");

    return `${paddedMins}.${paddedSecs}`;
}


const playMusic = (track , pause=false) => {


    currentSong.src = `/songs/${currFolder}/` + track;
    if(!pause){
        currentSong.play();
        play.src = "pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00  /  00:00";
}

async function main() {

     
    await getSongs("ncs")
    

    playMusic(songs[currentSongIdx],true);

    //display all the album
    await displayAlbums();

    //event-listener for play,next,prev button
    play.addEventListener("click", element => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "pause.svg";
        }
        else {
            currentSong.pause();
            play.src = "play.svg";
        }
    })
//add an event listener for next and previous button
    next.addEventListener("click",e=>{
        currentSongIdx++;
        if (currentSongIdx >= songs.length) {
        currentSongIdx = 0;
        }
        
        playMusic(songs[currentSongIdx]);
    })
    previous.addEventListener("click",e=>{
        currentSongIdx--;
        if (currentSongIdx < 0) {
        currentSongIdx = songs.length-1;
        }
        // currentSong.src = "/songs/128-" + songs[currentSongIdx];
        playMusic(songs[currentSongIdx]);
    })

    currentSong.addEventListener("timeupdate",element=>{
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesFormat(currentSong.currentTime)}/${secondsToMinutesFormat(currentSong.duration)}`;
        document.querySelector(".circle").style.left = `${(currentSong.currentTime/currentSong.duration)*100}%`
    })
//for volume change


volumeSlider.addEventListener('input', () => {
    currentSong.volume = volumeSlider.value;
    
     const volumeImg = document.querySelector(".volume > img");

    if (volumeImg.src.includes("mute.svg") && volumeSlider.value > 0) {
        volumeImg.src = volumeImg.src.replace("mute.svg", "volume.svg");
     }
});


//Adding the eventListener to the seekbar

    document.querySelector(".seekbar").addEventListener("click",element=>{
        let percentage = (element.offsetX/element.target.getBoundingClientRect().width)*100;
        document.querySelector(".circle").style.left =  percentage + "%";
        currentSong.currentTime = (percentage * currentSong.duration)/100;
    })
//add an eventListener to the hamburger icon
    document.querySelector(".hamburger").addEventListener("click",e=>{
        document.querySelector(".left").style.left="0"
    })
    //add an eventListener to the close icon
    document.querySelector(".close").addEventListener("click",e=>{
         document.querySelector(".left").style.left="-100%"
    })
//mute button working
let volumeBtn = document.querySelector(".volume-img");
volumeBtn.addEventListener("click",e=>{
    muteMusic(e);
})

 

}


main()
