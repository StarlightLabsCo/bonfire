export type StoryStep = {
  text: string;
  audioUrl: string;
  audioWordTimings: string;
  imageUrl: string;
  choices: Choice[];
};

export type Choice = {
  choice: string;
  next: StoryStep | null;
};

function generateStory() {
  // Generate text
  // Generate audio & word timings
  // Generate images
  // Generate new choices
}
