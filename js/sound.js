let twGain = new Tone.Gain(1.5).toDestination();
let typewriter = new Tone.Channel(1).toDestination();
//typewriter.mute = true;
let twplayer = new Tone.Player({
    url: "sounds/typewriter.wav",
    loop: true,
  }).sync().start(0);

  twplayer.connect(typewriter).connect(twGain);
  twGain.gain.rampTo(0.2,30);

  let projGain = new Tone.Gain(2.0).toDestination();
  let projector = new Tone.Channel(1).toDestination();
//typewriter.mute = true;
let projplayer = new Tone.Player({
    url: "sounds/projektor.wav",
    loop: true,
  }).sync().start(0);

  projplayer.connect(projector).connect(projGain);
  projGain.gain.rampTo(0.2,30);

  let therGain = new Tone.Gain(0.1).toDestination();
  let thermelody = new Tone.Channel(1).toDestination();
 // thermelody.gain = 0.1;
  //typewriter.mute = true;
  let therplayer = new Tone.Player({
      url: "sounds/Theremin_Begleitung_Theremin_2-5.wav",
      loop: true,
    }).sync().start(0);
    
    therplayer.connect(thermelody).connect(therGain);
    therGain.gain.rampTo(0.05,5);

//   let synth = new Tone.Channel(1).toDestination();
// //typewriter.mute = true;
// let synthplayer = new Tone.Player({
//     url: "sounds/synth.wav",
//     loop: true,
//   }).sync().start(0);

//   synthplayer.connect(synthplayer);


