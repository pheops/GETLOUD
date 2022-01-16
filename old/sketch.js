 let samples = ["getloud/kick.wav", "getloud/snare.wav", "getloud/hihat.wav", "getloud/perc1.wav",
                "getloud/perc2.wav", "getloud/bass1.wav", "getloud/bass2.wav", "getloud/bass3.wav",
                "getloud/guitar4.wav", "getloud/guitar1.wav", "getloud/guitar2.wav", "getloud/guitar3.wav",
                "getloud/synth1.wav", "getloud/synth2.wav", "getloud/vocal1.wav", "getloud/vocal2.wav",]


// const makeSynths = (count) => {
//   // declare array to store synths
//   const synths = [];


//   for (let i = 0; i < count; i++) {

//     let synth = new Tone.Synth({
//       oscillator: {
//         type: "square8"
//       }
//     }).toDestination();
   
   
//     synths.push(synth);
//   }

//   return synths;
// };

const configPlayButton = () => {
  const button = document.getElementById("play-button");
  button.addEventListener("click", (e) => {
    if (!started) {
      Tone.start();
      Tone.getDestination().volume.rampTo(-10, 0.001)
      configLoop();
      started = true;


    }

    if (playing) {
      e.target.innerText = "PLAY";
      Tone.Transport.stop();
      playing = false;
    } else {
      e.target.innerText = "STOP";
      Tone.Transport.start();
      playing = true;
    }
  });
};

const makePlayers = (count) => {
  // declare array to store players
   const players = [];


  for (let i = 0; i < count; i++) {
   var soundz = (samples[i]);

    let player =  new Tone.Player(soundz).toDestination();

    players.push(player);
  }

  return players;


};

const players = makePlayers(16);

// console.log(players[2]);

//setup a polyphonic sampler
    // var keys = new Tone.Players({
    //   "kick" : "assets/606kick.wav",
    //   "snare" : "assets/606snare.wav",
    //   "hat" : "assets/606hat.wav",
    //   "clap" : "assets/clap_sample.mp3",
    // }, {
    //   "volume" : -10,
    //   "fadeOut" : "64n",
    // }).toMaster();


    
// let kick =  new Tone.Player("assets/606kick.wav").toDestination();
// let snare =  new Tone.Player("assets/606snare.wav").toDestination();
// let hat =  new Tone.Player("assets/606hat.wav").toDestination();
// let clap =  new Tone.Player("assets/clap_sample.mp3").toDestination();






const makeGrid = (notes) => {
  // our "notation" will consist of an array with 6 sub arrays
  // each sub array corresponds to one row in our sequencer grid

  // parent array to hold each row subarray
  const rows = [];

  for (const note of notes) {
    // declare the subarray
    const row = [];
    // each subarray contains multiple objects that have an assigned note
    // and a boolean to flag whether they are "activated"
    // each element in the subarray corresponds to one eigth note
    for (let i = 0; i < 16; i++) {
      row.push({
        note: note,
        isActive: false
      });
    }
    rows.push(row);
  }

  // we now have 6 rows each containing 16 eighth notes
  return rows;
};







//const synths = makeSynths(6);

// declaring the notes for each row
//const notes = ["F4", "Eb4", "C4", "Bb3", "Ab3", "F3","F4", "Eb4", "C4", "Bb3", "Ab3", "F3"];
const notes = ["kick", "snare", "hat", "perc1", "perc2", "bass1", "bass2", "bass3", , "guitar4", "guitar1", "guitar2", "guitar3", "synth1", "synth2", "vocal1", ];
let grid = makeGrid(notes);
let beat = 0;
let playing = false;
let started = false;

const configLoop = () => {

  const repeat = (time) => {
    grid.forEach((row, index) => {
      //let synth = synths[index];
      let player = players[index];
      let note = row[beat];
      if (note.isActive) {
        //synth.triggerAttackRelease(note.note, "8n", time);
         player.start(time);
      }
    });

    beat = (beat + 1) % 16;
  };

  Tone.Transport.bpm.value = 124;
  Tone.Transport.scheduleRepeat(repeat, "8n");
};

const makeSequencer = () => {
  const sequencer = document.getElementById("sequencer");
  grid.forEach((row, rowIndex) => {
    const seqRow = document.createElement("div");
    seqRow.id = `rowIndex`;
    seqRow.className = "sequencer-row";

    row.forEach((note, noteIndex) => {
      const button = document.createElement("button");
      button.className = "note"
      button.addEventListener("click", function(e) {
        handleNoteClick(rowIndex, noteIndex, e);
      });

      seqRow.appendChild(button);
    });

    sequencer.appendChild(seqRow);
  });
};

const handleNoteClick = (clickedRowIndex, clickedNoteIndex, e) => {
  grid.forEach((row, rowIndex) => {
    row.forEach((note, noteIndex) => {
      if (clickedRowIndex === rowIndex && clickedNoteIndex === noteIndex) {
        note.isActive = !note.isActive;
         e.target.className = classNames(
          "note", 
          { "note-is-active": !!note.isActive }, 
          { "note-not-active": !note.isActive }
         );
      }
    });
  });
};



/* configPlayButton();
makeSequencer(); */
window.addEventListener("DOMContentLoaded", () => {
  configPlayButton();
  makeSequencer();
});
