// Tour for Network with entites 

const tour = new Shepherd.Tour({
    defaultStepOptions: {
    cancelIcon: {
        enabled: true
    },
    classes: 'class-1 class-2',
    scrollTo: { behavior: 'smooth', block: 'center' },
    }
});

tour.addStep({
  title: 'Search',
  text: `Type name of an entity in the search bar or explore the entities through search dropdown menu.`,
  attachTo: {
    element: '.search',
    on: 'left'
  },
  buttons: [
    {
      action() {
        return this.next();
      },
      text: 'Next'
    }
  ],
  popperOptions: {
    modifiers: [{ name: 'offset', options: { offset: [0, 20] } }]
  },
  id: 'creating'
});
  
tour.addStep({
  title: 'Spiritual Family',
  text: `Spiritual family are examples of objects that inspired Eisenstein’s cinematic and theoretical work. 
  Selecting any of these objects highlight all related events in the view. 
  These examples of spiritual family can also be experienced in the VR and 3D environment.`,
  attachTo: {
    attachTo: {
      element: '.highlights',
      on: 'left'
    },
    buttons: [
      {
        action() {
          return this.next();
        },
        text: 'Next'
      }
    ],
    id: 'creating'

  }
}
);

  tour.addStep({
    title: 'Categories',
    text: ` The different events are assigned to at least one of three main categories: 
    1) Cinema and Theatre, 2) Biography and Personality, and 3) Writing and Teaching. 
    Selecting a category highlights the relevant data points in the visualization.`,
    attachTo: {
      element: '.categories',
      on: 'left'
    },
    // popperOptions: {
    //     modifiers: [{ name: 'offset', options: { offset: [260, -50] } }]
    //   },
    buttons: [
      {
        action() {
          return this.back();
        },
        classes: 'shepherd-button-secondary',
        text: 'Back'
      },
      {
        action() {
          return this.next();
        },
        text: 'Next'
      }
    ],
    id: 'creating'
  });

  tour.addStep({
    title: 'Entities',
    text: `The events are also categorised based on the entities they encompass. 
    Entities such as feature people, places, works, concepts, and miscellaneous could be featured in events.
    Selecting an entity type highlights the related data points in the visualization.`,
    attachTo: {
      element: '.entities',
      on: 'left'
    },
    buttons: [
      {
        action() {
          return this.back();
        },
        classes: 'shepherd-button-secondary',
        text: 'Back'
      },
      {
        action() {
          return this.next();
        },
        text: 'Next'
      }
    ],
    id: 'creating'
  });

  tour.addStep({
    title: 'Sound',
    text: `Sound is mapped to each of the three event categories. Clicking on the sound button will play combined sound of all categories, and
    upon selecting a category, sound connected to the selected category is triggered.`,
    attachTo: {
      element: '#legend1',
      on: 'left'
    },
    popperOptions: {
        modifiers: [{ name: 'offset', options: { offset: [50, -100] } }]
      },
    buttons: [
      {
        action() {
          return this.back();
        },
        classes: 'shepherd-button-secondary',
        text: 'Back'
      },
      {
        action() {
          return this.next();
        },
        text: 'Next'
      }
    ],
    id: 'creating'
  });

  tour.addStep({
    title: 'Right Panel',
    text: `The right panel of this network view contains a list of all the events; .
    The network view changes according to the events currently visible in the bar, 
    and scrolling through the events alters the networks according to the connections between the entities of the visible events`,
    attachTo: {
      element: '#eventList',
      on: 'right'
    },
    popperOptions: {
      modifiers: [{ name: 'offset', options: { offset: [0, 15] } }]
    },
    buttons: [
      {
        action() {
          return this.back();
        },
        classes: 'shepherd-button-secondary',
        text: 'Back'
      },
      {
        action() {
          return this.next();
        },
        text: 'End Tour'
      }
    ],
    id: 'creating'
  });

  const div = document.querySelector('.tour');

div.addEventListener('click', (event) => {
  tour.start();
});
  