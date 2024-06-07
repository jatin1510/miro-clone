# Miro Clone

This project is a clone of the popular Miro whiteboard application, built using modern web technologies and tools. Follow the tutorial by [Code with Antonio](https://www.youtube.com/@codewithantonio) to create your own collaborative whiteboard app.

|<img width="1439" alt="image" src="https://github.com/jatin1510/miro-clone/assets/72184476/02756b9e-7a33-4bf6-933e-d4119d16153d">|
|-|
|<img width="1440" alt="image" src="https://github.com/jatin1510/miro-clone/assets/72184476/3c038d07-457e-44da-8019-15330ca4ecc8">|
|<img width="1440" alt="image" src="https://github.com/jatin1510/miro-clone/assets/72184476/8df60147-bb35-4a2b-aaa7-73161cd9d1b5">|

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Backend**: [convex](https://www.convex.dev/)
- **Real-time Collaboration**: [liveblocks](https://liveblocks.io/)

## Deployment

The application is deployed on Vercel. Check it out [here](https://miro-clone-chi.vercel.app).

## Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

Make sure you have the following installed on your system:

- Node.js (>= 14.x)
- npm

### Installation

1. **Clone the repository:**

    ```sh
    git clone https://github.com/jatin1510/miro-clone
    cd miro-clone
    ```

2. **Install dependencies:**

    ```sh
    npm install
    ```

3. **Configure environment variables:**

    Create a `.env.local` file in the root directory and add your configuration variables. You can explore the `.env.example` file for more information.

4. **Clerk Setup**
   - Enable Organization from the "Organization settings"
   - Add JWT Template named "convex" <img width="792" alt="image" src="https://github.com/jatin1510/miro-clone/assets/72184476/43e12f31-aa7c-4a51-b8f9-ffef2846f621">
   - Make sure to have `org_id` and `org_role` inside **Claims** <img width="628" alt="image" src="https://github.com/jatin1510/miro-clone/assets/72184476/1536a650-4898-46e0-8e7c-3c2dc229688a">
   - Don't forget to add issuer into the `auth.config.js` inside /convex.

5. **Prepare the convex functions:**
    ```sh
    npx convex dev
    ```

6. **Run the development server:**

    ```sh
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- **Real-time collaboration**: Multiple users can interact on the whiteboard simultaneously.
- **Interactive UI**: Intuitive and responsive user interface for a seamless experience.
- **Scalable backend**: Powered by Convex for managing backend logic and data storage.
- **Live updates**: Instant updates using Liveblocks for real-time synchronization.

### New Features

- **Keyboard Shortcuts**:
  - **Move Selected Layers**: Use keyboard shortcuts to move selected layers within the Canvas component.
  - **Duplicate Layers**: Duplicate selected layers with `Ctrl + D`.
  - **Focus Search Input**: Keyboard shortcut to focus on the search input field.
  

- **Enhanced Selection Tool**:
  - **Improved Layout and Functionality**: Added a duplicate icon in the selection box for better usability.
  - **Select Fully Inside Rectangle**: Layers are only selected if they are fully inside the selection rectangle.
  - **Shortcuts for Layer Insertion**: Added keyboard shortcuts for selection and insertion in the toolbar

- **Board Creation Limit**:
  - User can make only 5 boards within an organization

- **Reset Camera**:
  - When the user scrolls through the canvas, a button at the right bottom appears through which the user can reset the camera position

- **Color Picker**:
  - User now has infinite possible combinations of the layer they want. Color picker also has the debouncing technique to prevent the numerous undo/redo actions

- **Export as a PNG**:
  - Users can now export their board as a PNG image file. This functionality allows users to save their work and share it with others easily.

- **Bug Fixes**:
  - **Search and Favorite Functionality**: Fixed the search and favorite functionality by using `useSearchParams`.

## Tutorial

This project follows the tutorial by [Code with Antonio](https://www.youtube.com/@codewithantonio). Watch the full tutorial on [YouTube](https://www.youtube.com/watch?v=ADJKbuayubE).

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

---
