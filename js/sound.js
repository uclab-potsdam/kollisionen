let typewriter = new Tone.Channel(1).toDestination();
//typewriter.mute = true;
let twplayer = new Tone.Player({
    url: "sounds/typewriter.wav",
    loop: true,
  }).sync().start(0);

  twplayer.connect(typewriter);

  let projector = new Tone.Channel(1).toDestination();
//typewriter.mute = true;
let projplayer = new Tone.Player({
    url: "sounds/projektor.wav",
    loop: true,
  }).sync().start(0);

  projplayer.connect(projector);

  let synth = new Tone.Channel(1).toDestination();
//typewriter.mute = true;
let synthplayer = new Tone.Player({
    url: "sounds/synth.wav",
    loop: true,
  }).sync().start(0);

  synthplayer.connect(synthplayer);


