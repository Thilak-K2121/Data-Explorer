# Data Explorer 🚀

An intelligent platform for dynamic CSV visualization. Upload any CSV file and watch as Data Explorer automatically generates a beautiful, interactive dashboard with insightful charts.

---

## ✨ About The Project

Data Explorer was built to solve a simple problem: visualizing data from CSV files should be fast, intuitive, and beautiful. Instead of writing code or wrestling with complex BI tools for a quick analysis, you can simply drag and drop a file.

The backend intelligently analyzes the structure of your CSV, identifies numeric and date columns, and automatically generates a variety of relevant charts. The frontend provides a sleek, modern, and interactive interface to display these insights.

---

## 🎨 Key Features

* **Dynamic Visualization:** Automatically generates line charts, histograms, and correlation heatmaps based on your data's content.
* **Intelligent Analysis:** The backend smartly detects data types to create the most appropriate visualizations without any configuration.
* **Modern UI/UX:** A beautiful glassmorphism design with fluid animations powered by Framer Motion.
* **Interactive Upload:** A seamless drag-and-drop file uploader for a great user experience.
* **Fully Interactive Charts:** All charts are rendered with Plotly.js, allowing for hover, zoom, and pan capabilities.

---

## 🔧 Tech Stack

This project is a full-stack application built with modern technologies.

### **Frontend**

* **React:** A JavaScript library for building user interfaces.
* **Vite:** A lightning-fast frontend build tool.
* **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
* **Framer Motion:** A production-ready motion library for animations.
* **Plotly.js:** A high-level charting library for interactive visualizations.

### **Backend**

* **Python:** A versatile and powerful programming language.
* **FastAPI:** A modern, high-performance web framework for building APIs.
* **Pandas:** The go-to library for data manipulation and analysis in Python.
* **Plotly (Python):** The Python graphing library to generate chart data.
* **Uvicorn:** A lightning-fast ASGI server for running FastAPI.

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have the following installed on your machine:
* **Node.js** (v18 or later)
* **Python** (v3.8 or later) & `pip`

### Installation

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/your-username/data-explorer.git](https://github.com/your-username/data-explorer.git)
    cd data-explorer
    ```

2.  **Set up the Backend:**
    ```sh
    # Navigate to the backend directory
    cd backend

    # Create and activate a virtual environment
    python -m venv venv
    # On Windows:
    .\venv\Scripts\activate
    # On macOS/Linux:
    source venv/bin/activate

    # Install the required Python packages
    pip install -r requirements.txt
    ```

3.  **Set up the Frontend:**
    ```sh
    # Navigate to the frontend directory from the root
    cd frontend

    # Install the required npm packages
    npm install
    ```

---

## 🏃‍♀️ Running the Application

You'll need to run the backend and frontend servers in separate terminal windows.

1.  **Start the Backend Server:**
    * Open a terminal in the `backend` directory.
    * Make sure your virtual environment is activated.
    * Run the following command:
    ```sh
    uvicorn app:app --reload
    ```
    Your backend API will be running at `http://127.0.0.1:8000`.

2.  **Start the Frontend Server:**
    * Open a second terminal in the `frontend` directory.
    * Run the following command:
    ```sh
    npm run dev
    ```
    Your frontend application will be running at `http://localhost:5173`.

Now, open your browser and navigate to `http://localhost:5173` to use the application!

---

## 🛣️ Future Roadmap

While the core functionality is in place, here are some exciting features planned for the future:

* [ ] **🤖 AI-Powered Insights:** Integrate with an LLM (like Gemini) to provide automatic, human-readable summaries of the visualized data.
* [ ] **📊 Interactive Column Selection:** Allow users to choose which columns to visualize and what chart types to use.
* [ ] **🌐 Visualize from URL:** Add the ability to paste a URL to a raw CSV file online for instant visualization.
* [ ] **🧠 Unsupervised Clustering:** Automatically run K-Means clustering to identify hidden groups in the data and visualize them.
