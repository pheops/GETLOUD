// Master volume in decior audio
let synth;
let sampler;
var database;
var patterns = []
var pbutton = []


// Whether the audio sequence is playing
let playing = false;

// The current Tone.Sequence
let sequence;

// The currently playing column
let currentColumn = 0;

// Here is the fixed scale we will use
    const notes = ["A0", "E0", "A1", "E1", "A2", "E2", "A3", "E3",
                   "A4", "E4", "A5", "E5", "A6", "E6", "A7", "E7"];



// Number of rows is the number of different notes
const numRows = notes.length;

// Number of columns is depending on how many notes to play in a measure
const numCols = 16;
const noteInterval = `${numCols}n`;

// Setup audio config
Tone.Transport.bpm.value = 124;

// Create a Row*Col data structure that has nested arrays
// [ [ 0, 0, 0 ], [ 0, 0, 0 ], ... ]
// The data can be 0 (off) or 1 (on)
let data = [];
for (let y = 0; y < numRows; y++) {
  const row = [];
  for (let x = 0; x < numCols; x++) {
    row.push(0);
  }
  data.push(row);
}




// Create a new canvas to the browser size
async function setup() {

  var config = {
    apiKey: "AIzaSyD74PiyPqRdyHZZspk8Gktd4aqzcTzTkGs",
    authDomain: "getloud-d44c4.firebaseapp.com",
    projectId: "getloud-d44c4",
    storageBucket: "getloud-d44c4.appspot.com",
    databaseURL: "https://getloud-d44c4-default-rtdb.firebaseio.com/",
    messagingSenderId: "316125851912",
    appId: "1:316125851912:web:f87fed4d0f13cc4edd3cbd",
    measurementId: "G-6NG4DK9ZEP"
  }

firebase.initializeApp(config);

database = firebase.database();

var params = getURLParams();
  //console.log(params);
  if (params.id) {
    //console.log(params.id);
    showDrawing(params.id);
  }

  var ref = database.ref('UserPatterns');
  ref.on('value', gotData, errData);
//console.log(database);


  // Setup canvas size as a square
  //const dim = max(windowWidth, windowHeight);

  cnv = createCanvas(400, 400);
  cnv.mousePressed(canvasPressed);
  cnv.parent('sketch-holder');

  //pixelDensity(window.devicePixelRatio);

  // Clear with black on setup
  background(0);

  // Setup a reverb with ToneJS
  const reverb = new Tone.Reverb({
    decay: 4,
    wet: 0.2,
    preDelay: 0.25
  });

  // Load the reverb
  await reverb.generate();

  // Create an effect node that creates a feedback delay
  const effect = new Tone.FeedbackDelay(`${Math.floor(numCols / 2)}n`, 1 / 3);
  effect.wet.value = 0.2;

  // Setup a synth with ToneJS
  // We use a poly synth which can hold up to numRows voices
  // Then we will play each note on a different voice
  synth = new Tone.PolySynth(numRows, Tone.DuoSynth);

  sampler = new Tone.Sampler({
   "A0" : "getloud/kick.wav",
   "E0" : "getloud/snare.wav",
   "A1" : "getloud/hihat.wav",
   "E1" : "getloud/perc1.wav",
   "A2" : "getloud/perc2.wav",
   "E2" : "getloud/perc3.wav",
   "A3" : "getloud/bass1.wav",
   "E3" : "getloud/bass2.wav",
   "A4" : "getloud/bass3.wav",
   "E4" : "getloud/guitar1.wav",
   "A5" : "getloud/guitar2.wav",
   "E5" : "getloud/guitar3.wav",
   "A6" : "getloud/synth1.wav",
   "E6" : "getloud/synth2.wav",
   "A7" : "getloud/vocal1.wav",
   "E7" : "getloud/vocal2.wav",
 
  }, function(){
   //sampler will repitch the closest sample
   //sampler.triggerAttack("D3")
  // sampler.triggerAttack(["A1", "E2", "G3", "B4"], 0.5);

  })


  
  // Setup the synths a little bit
  synth.set({
    voice0: {
      oscillator: {
        type: "triangle4"
      },
      volume: -30,
      envelope: {
        attack: 0.005,
        release: 0.05,
        sustain: 1
      }
    },
    voice1: {
      volume: -10,
      envelope: {
        attack: 0.005,
        release: 0.05,
        sustain: 1
      }
    }
  });
  synth.volume.value = -10;
  ///////////////////////
  //set up sample players



  // Wire up our nodes:
  synth.connect(effect);
  synth.connect(Tone.Master);
  effect.connect(reverb);
  reverb.connect(Tone.Master);
  synth.volume.value = -10;
  sampler.connect(Tone.Master);

  // Every two measures, we randomize the notes
  // We use Transport to schedule timer since it has
  // to be exactly in sync with the audio
  Tone.Transport.scheduleRepeat(() => {
   // randomizeSequencer();
  }, "2m");
}

// On window resize, update the canvas size
// function windowResized() {
//   const dim = max(windowWidth, windowHeight);
//   resizeCanvas(dim, dim);
// }







// Render loop that draws shapes with p5
function draw() {
  // Our synth isn't loaded yet, don't draw anything
  if (!synth) return;
  if (!sampler) return;

 

  const dim = 400//min(width, height);


  // Black background
  background(0);

  //if (playing) {
    // The audio is playing so we can show the sequencer
    const margin = 0//0//dim * 0.1;
    const innerSize = 400//dim - margin * 2;
    const cellSize = innerSize / numCols;

    // Loop through the nested data structure, drawing each note
    for (let y = 0; y < data.length; y++) {
      const row = data[y];
      for (let x = 0; x < row.length; x++) {
        const u = x / (numCols );
        const v = y / (numRows );
        let px = lerp(margin, dim - margin, u);
        let py = lerp(margin, dim - margin, v);

     
    

        noStroke();
        noFill();
        //strokeWeight(1);
        // note on=fill, note off=stroke
        if (row[x] === 1) fill(235, 155, 52);
        else stroke(255);
  strokeWeight(1);
        // draw note
         circle(px + 12, py + 12, 22);
        //rect(px + 1 , py + 1 , 22, 22);
         
 if (playing) {
        // draw a rectangle around the currently playing column
        if (x === currentColumn) {
          //rectMode(CENTER);
          //rect(px, py, cellSize*2, cellSize*2);
            noStroke();
            //let fade = lerp(22,40,0.3)
          circle(px + 12, py + 12, 35);
          stroke(235, 155, 52);
          line(px + 12, 0, px + 12,py + 24)
        }
      }
      }
    }
// noFill()
// stroke(255)
// strokeWeight(3);
// rect(0,0, 400, 400)


 // } else {
    // // Draw a 'play' button
    // noStroke();
    // fill(255);
    // polygon(width / 2, height / 2, dim * 0.1, 3);
 // }
}



function canvasPressed() {

  //console.log(data);
    const dim = 400//max(width, height);
    const margin = 0//dim * 0.1;
    const innerSize = 400//dim - margin * 2;
    const cellSize = innerSize / numCols;

    posX = (mouseX - margin)
    //console.log(posX)
    posY = (mouseY - margin)
  
  let xPos = floor(16 * posX/innerSize)
  let yPos = floor(16 * posY/innerSize)

     //console.log(xPos)
     // console.log(yPos)

  let rowClicked = yPos//floor(16 * mouseY/height) //+ margin;
  let indexClicked = xPos//floor(16 * mouseX/width )  //+ margin;


  // let indexClicked = floor(16 * mouseX/width )  //+ margin;
  // let rowClicked = floor(16 * mouseY/height) //+ margin;

if (indexClicked <= 15){
  if (rowClicked === 0) {
    //console.log('first row ' + indexClicked);
    const row1 = data[0];
    row1[indexClicked] = +!row1[indexClicked];
  } else if (rowClicked === 1) {
    const row2 = data[1];
    row2[indexClicked] = +!row2[indexClicked];  
  } else if (rowClicked === 2) {
    const row3 = data[2];
    row3[indexClicked] = +!row3[indexClicked];
  } else if (rowClicked === 3) {
    const row4 = data[3];
    row4[indexClicked] = +!row4[indexClicked];
  } else if (rowClicked === 4) {
    const row5 = data[4];
    row5[indexClicked] = +!row5[indexClicked];
  } else if (rowClicked === 5) {
    const row6 = data[5];
    row6[indexClicked] = +!row6[indexClicked];
  } else if (rowClicked === 6) {
    const row7 = data[6];
    row7[indexClicked] = +!row7[indexClicked];  
  } else if (rowClicked === 7) {
    const row8 = data[7];
    row8[indexClicked] = +!row8[indexClicked];
  } else if (rowClicked === 8) {
    const row9 = data[8];
    row9[indexClicked] = +!row9[indexClicked];
  } else if (rowClicked === 9) {
    const row10 = data[9];
    row10[indexClicked] = +!row10[indexClicked];
  } else if (rowClicked === 10) {
    const row11 = data[10];
    row11[indexClicked] = +!row11[indexClicked];
  } else if (rowClicked === 11) {
    const row12 = data[11];
    row12[indexClicked] = +!row12[indexClicked];
  } else if (rowClicked === 12) {
    const row13 = data[12];
    row13[indexClicked] = +!row13[indexClicked];
  } else if (rowClicked === 13) {
    const row14 = data[13];
    row14[indexClicked] = +!row14[indexClicked];
  } else if (rowClicked === 14) {
    const row15 = data[14];
    row15[indexClicked] = +!row15[indexClicked];
  } else if (rowClicked === 15) {
    const row16 = data[15];
    row16[indexClicked] = +!row16[indexClicked];
  } 
}
  // else if (rowClicked === 5) {
  //   console.log('sixth row');
  //   p2Pat[indexClicked] = +!p2Pat[indexClicked];
  // } else if (rowClicked === 6) {
  //   console.log('seventh row');
  //   p3Pat[indexClicked] = +!p3Pat[indexClicked];
  // } else if (rowClicked === 7) {
  //   console.log('eighth row');
  //   p4Pat[indexClicked] = +!p4Pat[indexClicked];
  // } 

  
  //drawMatrix();
}


// Here we randomize the sequencer with some data
function randomizeSequencer() {
  // Choose a % chance so that sometimes it is more busy, other times more sparse
  const chance = random(0.5, 1.5);
  for (let y = 0; y < data.length; y++) {
    // Loop through and create some random on/off values
    const row = data[y];
    for (let x = 0; x < row.length; x++) {
      row[x] = randomGaussian() > chance ? 1 : 0;
    }
    // Loop through again and make sure we don't have two
    // consectutive on values (it sounds bad)
    for (let x = 0; x < row.length - 1; x++) {
      if (row[x] === 1 && row[x + 1] === 1) {
        row[x + 1] = 0;
        x++;
      }
    }
  }
  //console.log(data[0]);
}






// Here is where we actually play the audio
function onSequenceStep(time, column) {
  // We build up a list of notes, which will equal
  // the numRows. This gets passed into our PolySynth
  let notesToPlay = [];

  // Go through each row
  data.forEach((row, rowIndex) => {
    // See if the note is "on"
     
    const isOn = row[column] == 1;
    // If its on, add it to the list of notes to play
    if (isOn) {
      const note = notes[rowIndex];
      notesToPlay.push(note);
      //console.log(notesToPlay);
    }
  });

  // Trigger a note
  const velocity = random(0.5, 1);
 
 
  //synth.triggerAttackRelease(notesToPlay, noteInterval, time, velocity);
  //sampler.triggerAttack("A1", time);

  sampler.triggerAttack(notesToPlay, time, velocity);

  Tone.Draw.schedule(function() {
    currentColumn = column;
  }, time);
}



const configPlayButton = () => {
  const button = document.getElementById("play-button");
  document.getElementById("play-button").src = "assets/play.png"

  button.addEventListener("click", (e) => {
   
    if (playing) {
      //e.target.innerText = "PLAY";
      // e.target.color = "coral";  
      document.getElementById("play-button").src ="assets/pause.png"
      playing = false;
      sequence.stop();
      Tone.Transport.stop();
    } else {
      // If we aren't currently playing, we can start the sequence
     document.getElementById("play-button").src ="assets/play.png"
    // We do this by creating an array of indices [ 0, 1, 2 ... 15 ]
    const noteIndices = newArray(numCols);
    // create the sequence, passing onSequenceStep function
    sequence = new Tone.Sequence(onSequenceStep, noteIndices, noteInterval);


      //e.target.innerText = "STOP";
      playing = true;
      sequence.start();
      Tone.Transport.start();
    }
  });
};

const configSaveButton = () => {
  const button2 = document.getElementById("save-button");
  button2.addEventListener("click", (e) => {
   e.target.innerText = "SAVE";
  //console.log(grid)
  savePattern();
 
})
}

const configClearButton = () => {
  const button3 = document.getElementById("clear-button");
  button3.addEventListener("click", (e) => {
   e.target.innerText = "CLEAR";
  //console.log(grid)
  clearPattern();
 
})
}

const configShareButton = () => {
   const button4 = document.getElementById("share-button");
   button4.addEventListener("click", (e) => {
   e.target.innerText = "SHARE";
  //console.log(grid)
  sharePattern();
 
})
}



/* configPlayButton();
makeSequencer(); */
window.addEventListener("DOMContentLoaded", () => {
  configSaveButton();
  configPlayButton();
  configClearButton();
  //configShareButton();
 
  //makeSequencer();
});

// Draw a basic polygon, handles triangles, squares, pentagons, etc
function polygon(x, y, radius, sides = 3, angle = 0) {
  beginShape();
  for (let i = 0; i < sides; i++) {
    const a = angle + TWO_PI * (i / sides);
    let sx = x + cos(a) * radius;
    let sy = y + sin(a) * radius;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

// A utility function to create a new array
// full of indices [ 0, 1, 2, ... (N - 1) ]
function newArray(n) {
  const array = [];
  for (let i = 0; i < n; i++) {
    array.push(i);
  }
  return array;
}


function clearPattern(){

data = [];

for (let y = 0; y < numRows; y++) {
  const row = [];
  for (let x = 0; x < numCols; x++) {
    row.push(0);
  }
  data.push(row);
}
}

function sharePattern(){
console.log("yo")
}



 function savePattern() {

  console.log(data)
   
     ref = database.ref('UserPatterns');

    var pattern = {
   
        grid: data,


  };
    var result = ref.push(pattern, dataSent);

          console.log(data)

    function dataSent(err, status) {
    console.log(status);
}

}

function gotData(grid) {
  //const pDiv = document.getElementById("presets");

  // clear the listing
  var elts = selectAll('.pbuttons');
  for (var i = 0; i < elts.length; i++) {
    elts[i].remove();
  }

  var patterns = grid.val();
  var keys = Object.keys(patterns);

  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
  
  var pbutton = createButton('', keys[i]);

  pbutton.class('pbuttons');
  pbutton.mousePressed(() => changePattern(keys[i]), );

  ///////PERMALINKS
    // var perma = createA('?id=' + key, 'link');
    // perma.parent(pbutton);
    // perma.style('padding', '4px');
  ///////PERMALINKS
  
    //li.parent('drawinglist');
  }

  //console.log(keys)

}


function changePattern(k){
     showDrawing(k);
}



function errData(err) {
  console.log(err);
}


function showDrawing(key) {
  //console.log(arguments);
  //clearDrawing();
//   if (key instanceof MouseEvent) {
//     console.log(key);
//     // key = this.html();
//   }
// console.log(key)


  var ref = database.ref('UserPatterns/' + key );

      
  ref.once('value', onePattern, errData);

  function onePattern(grid) {
    var dbpattern = grid.val();
  
    data = dbpattern.grid;

    

   //console.log(data);
    //updateGrid(grid);
  }

  
}
