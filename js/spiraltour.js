// Tour for Spiral Viz without entites 

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
  title: 'Highlights',
  text: `Highlights are the objects linked to selected themes of Eisenstein’s life. 
  Selecting objects highlights all events and categories that fall under these theme. 
  The highlights can also be experienced in the VR and 3D environment.`,
  attachTo: {
    element: '.highlights',
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
  title: 'Categories',
  text: ` The different events are assigned to at least one of three main categories: 
  1) Cinema and Theatre, 2) Biography and Personality, and 3) Writing and Teaching. 
  Selecting a category highlights the relevant data points in the visualization.`,
  attachTo: {
    element: '.categories',
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
  text: `Sound is mapped to each of the event which can be turned on and off using this trigger.`,
  attachTo: {
    element: '.switch',
    on: 'left-end'
  },
  popperOptions: {
      modifiers: [{ name: 'offset', options: { offset: [40, 60] } }]
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
  text: `The right panel of spiral visualization displays detailed information corresponding to selections in the visualization such as collection highlights and events.`,
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
