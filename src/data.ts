import { SkillCategory, ProjectData, Certification, Achievement, Education } from './types';

export const PERSONAL_INFO = {
  name: 'Anupkumar Koturwar',
  fullName: 'Anupkumar Koturwar',
  titles: [
    'Full-Stack Data Scientist',
    'Machine Learning Engineer',
    'AI Agent Developer',
    'Python Developer'
  ],
  bio: 'B.Tech Computer Science graduate with hands-on experience in machine learning, statistical modeling, data analysis, and NLP. Proficient in Python, scikit-learn, NumPy, pandas, and SQL, with practical experience building and deploying predictive models and multi-agent AI systems. Published IEEE researcher in NLP and computer vision. Strong foundation in Statistics, Algorithms, Data Structures, and Software Engineering — now focused on building agentic AI platforms with LangChain, LangGraph, and CrewAI.',
  email: 'koturwaranup@gmail.com',
  phone: '+91 8999881962',
  location: 'Hyderabad, Telangana, India',
  linkedIn: 'https://linkedin.com/in/anupkoturwar',
  gitHub: 'https://github.com/Anupk02',
  portfolioUrl: 'https://anupkumar.com',
  resumeUrl: 'https://drive.google.com/file/d/1kzf0g4AxrO6wCy7gYI_ap_rg0krVyUg0/view?usp=sharing'
};

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    category: 'Programming Languages',
    skills: ['Python', 'SQL', 'JavaScript', 'HTML5', 'CSS3']
  },
  {
    category: 'Machine Learning & Agentic AI',
    skills: [
      'Machine Learning (Regression, Classification, Clustering)',
      'Agentic AI',
      'AI Agents',
      'Prompt Engineering',
      'NLP',
      'Feature Engineering',
      'Model Evaluation',
      'LLMs',
      'RAG',
      'LangChain',
      'LangGraph',
      'CrewAI'
    ]
  },
  {
    category: 'Frameworks & Libraries',
    skills: [
      'Scikit-learn',
      'Pandas',
      'NumPy',
      'Matplotlib',
      'Seaborn',
      'NLTK',
      'spaCy',
      'OpenCV',
      'Flask',
      'FastAPI'
    ]
  },
  {
    category: 'Data Analysis & Evaluation',
    skills: [
      'EDA (Exploratory Data Analysis)',
      'Data Cleaning',
      'Data Preprocessing',
      'Statistical Analysis',
      'Hypothesis Testing'
    ]
  },
  {
    category: 'Visualization Platforms',
    skills: ['Matplotlib', 'Seaborn', 'Plotly', 'Power BI', 'Tableau']
  },
  {
    category: 'Databases',
    skills: ['MySQL', 'MongoDB', 'SQLite', 'PostgreSQL', 'ChromaDB']
  },
  {
    category: 'Tools & Ecosystem',
    skills: [
      'Git',
      'GitHub',
      'Docker',
      'GitHub Actions',
      'Ollama',
      'Jupyter',
      'Google Colab',
      'VS Code',
      'Postman',
      'REST APIs',
      'AWS'
    ]
  },
  {
    category: 'Competencies',
    skills: ['Problem Solving', 'Analytical Thinking', 'Team Collaboration']
  }
];

export const PROJECTS: ProjectData[] = [
  {
    title: 'Autonomous DevOps AI Platform',
    slug: 'devops-ai-platform',
    tagline: 'Multi-agent AI platform automating repository analysis, build validation, and CI/CD generation.',
    featured: true,
    stack: [
      'Python',
      'FastAPI',
      'React',
      'LangChain',
      'LangGraph',
      'CrewAI',
      'ChromaDB',
      'SQLite',
      'Docker',
      'GitHub Actions',
      'Ollama'
    ],
    overview: 'An advanced AI-powered DevOps platform automating software repository analysis and troubleshooting workflows. Driven by highly collaborative multi-agent systems, it diagnoses compilation errors, compiles resolution logs, and generates fully test-passed GitHub Actions integrations.',
    features: [
      'AI-powered DevOps agent workspace automating comprehensive repo analysis and troubleshooting workflows.',
      'Advanced multi-agents handling log analysis, build logs tracing, root cause evaluation, and predictive failures.',
      'Autonomous generation of unit testing blocks and seamless CI/CD validation pipelines.',
      'Dense RAG pipelines leveraging ChromaDB and Sentence Transformers to retrieve local historical build sheets, documentation guidelines, and troubleshooting patterns.',
      'Fully-local LLM execution with Ollama integrations embedded into standard Docker containers for full host reproducibility.',
      'Validated rigorously against simulated build pipelines and standard workspace repositories.'
    ],
    description: [
      'Developed an AI-powered DevOps platform using FastAPI, LangChain, LangGraph, and CrewAI to automate repository analysis and troubleshooting workflows.',
      'Implemented multi-agent systems for build validation, log analysis, root cause analysis, unit test generation, and CI/CD workflow creation.',
      'Built a RAG pipeline using ChromaDB and Sentence Transformers to retrieve documentation, historical issues, and troubleshooting knowledge for context-aware recommendations.',
      'Integrated local LLMs with Ollama and Dockerized the application for reproducible deployments.',
      'Validated the platform on sample GitHub repositories and simulated build failures to evaluate agent outputs and troubleshooting accuracy.'
    ],
    diagramNodes: [
      { id: '1', label: 'GitHub Repository', type: 'source' },
      { id: '2', label: 'Repo Analysis Agent', type: 'process' },
      {
        id: '3',
        label: 'CrewAI Collaborative Agents Workspace',
        type: 'parallel_group',
        subnodes: [
          'Build Validation Agent',
          'Log Analysis Agent',
          'Root Cause analyst',
          'Unit Test Generator Agent'
        ]
      },
      { id: '4', label: 'RAG Layer (ChromaDB + Sentence Transformers)', type: 'database' },
      { id: '5', label: 'LangGraph Orchestrator Engine', type: 'process' },
      { id: '6', label: 'Auto-Generated Workflows & Reports', type: 'output' },
      { id: '7', label: 'Dockerized Deployed Instance', type: 'output' }
    ],
    gitRepo: {
      name: 'autonomous-devops-ai',
      type: 'folder',
      children: [
        {
          name: 'backend',
          type: 'folder',
          children: [
            {
              name: 'app',
              type: 'folder',
              children: [
                { name: 'main.py', type: 'file' },
                {
                  name: 'api',
                  type: 'folder',
                  children: [
                    {
                      name: 'routes',
                      type: 'folder',
                      children: [
                        { name: 'repo_analysis.py', type: 'file' },
                        { name: 'build_validation.py', type: 'file' },
                        { name: 'reports.py', type: 'file' }
                      ]
                    }
                  ]
                },
                {
                  name: 'agents',
                  type: 'folder',
                  children: [
                    { name: 'log_analyzer_agent.py', type: 'file' },
                    { name: 'root_cause_agent.py', type: 'file' },
                    { name: 'test_generator_agent.py', type: 'file' },
                    { name: 'cicd_workflow_agent.py', type: 'file' }
                  ]
                },
                {
                  name: 'rag',
                  type: 'folder',
                  children: [
                    { name: 'retriever.py', type: 'file' },
                    { name: 'embeddings.py', type: 'file' }
                  ]
                },
                {
                  name: 'db',
                  type: 'folder',
                  children: [{ name: 'models.py', type: 'file' }]
                },
                {
                  name: 'core',
                  type: 'folder',
                  children: [{ name: 'config.py', type: 'file' }]
                }
              ]
            },
            { name: 'requirements.txt', type: 'file' },
            { name: 'Dockerfile', type: 'file' }
          ]
        },
        {
          name: 'frontend',
          type: 'folder',
          children: [
            {
              name: 'src',
              type: 'folder',
              children: [
                { name: 'components', type: 'folder' },
                { name: 'pages', type: 'folder' },
                { name: 'App.jsx', type: 'file' }
              ]
            },
            { name: 'Dockerfile', type: 'file' }
          ]
        },
        {
          name: '.github',
          type: 'folder',
          children: [
            {
              name: 'workflows',
              type: 'folder',
              children: [{ name: 'ci-cd.yml', type: 'file' }]
            }
          ]
        },
        { name: 'chroma_db', type: 'folder' },
        { name: 'docker-compose.yml', type: 'file' },
        { name: 'README.md', type: 'file' }
      ]
    }
  },
  {
    title: 'AI Research & Patent Intelligence Platform',
    slug: 'ai-research-patent-intel',
    tagline: 'Semantic patent similarity profiling, competitor monitoring, and citation-aware research gap analysis.',
    featured: true,
    stack: [
      'Python',
      'FastAPI',
      'React',
      'LangChain',
      'LangGraph',
      'CrewAI',
      'ChromaDB',
      'PostgreSQL',
      'Docker',
      'Ollama'
    ],
    overview: 'A smart patent and scientific research indexing system. By utilizing semantic vector embeddings and specialized CrewAI agents, it detects complex prior art, maps out strategic competitor gaps, and produces complete citation reports inside a high-performance React dashboard.',
    features: [
      'Dense intellectual property analyzer targeting deep similarity checks across technical documents and patents.',
      'CrewAI workflows designed specifically for novelty checks, competitor overlap logs, research opportunity mapping, and reporting.',
      'Citation-aware retrievals using ChromaDB vectors cross-referenced with local Sentence Transformer embedding weights.',
      'Interactive visual dashboard providing granular graphs, document indexing portals, and responsive chatbot assistants.',
      'Fully dockerized multi-service orchestrations validated with actual patent and academic research datasets.'
    ],
    description: [
      'Built an AI-powered research and patent intelligence platform for semantic analysis of research papers and patent documents.',
      'Designed multi-agent workflows for patent similarity detection, competitor analysis, research gap identification, and automated report generation.',
      'Implemented advanced RAG pipelines with ChromaDB and Sentence Transformers for contextual question answering and citation-aware retrieval.',
      'Developed scalable FastAPI APIs and an interactive React dashboard for document upload, analysis, and visualization.',
      'Evaluated retrieval quality and agent responses using publicly available research papers and patent datasets through end-to-end Docker testing.'
    ],
    diagramNodes: [
      { id: '1', label: 'Document Upload Portal (PDF)', type: 'source' },
      { id: '2', label: 'Sentence Transformer Encoder', type: 'process' },
      { id: '3', label: 'ChromaDB Local Vector DB', type: 'database' },
      {
        id: '4',
        label: 'CrewAI Analytical Workspace',
        type: 'parallel_group',
        subnodes: [
          'Similarity Profiler Agent',
          'Competitor Track Agent',
          'Modern Gaps Identification Agent'
        ]
      },
      { id: '5', label: 'Semantic Patent Report Writer', type: 'process' },
      { id: '6', label: 'Interactive Citation Dashboard', type: 'output' }
    ],
    gitRepo: {
      name: 'ai-research-patent-intel',
      type: 'folder',
      children: [
        {
          name: 'backend',
          type: 'folder',
          children: [
            {
              name: 'app',
              type: 'folder',
              children: [
                { name: 'main.py', type: 'file' },
                {
                  name: 'agents',
                  type: 'folder',
                  children: [
                    { name: 'similarity_agent.py', type: 'file' },
                    { name: 'competitor_analysis_agent.py', type: 'file' },
                    { name: 'research_gap_agent.py', type: 'file' },
                    { name: 'report_generator_agent.py', type: 'file' }
                  ]
                },
                {
                  name: 'rag',
                  type: 'folder',
                  children: [
                    { name: 'chroma_store.py', type: 'file' },
                    { name: 'sentence_embeddings.py', type: 'file' }
                  ]
                },
                {
                  name: 'api',
                  type: 'folder',
                  children: [
                    {
                      name: 'routes',
                      type: 'folder',
                      children: [
                        { name: 'documents.py', type: 'file' },
                        { name: 'analysis.py', type: 'file' },
                        { name: 'reports.py', type: 'file' }
                      ]
                    }
                  ]
                },
                {
                  name: 'db',
                  type: 'folder',
                  children: [{ name: 'postgres_models.py', type: 'file' }]
                }
              ]
            },
            { name: 'requirements.txt', type: 'file' },
            { name: 'Dockerfile', type: 'file' }
          ]
        },
        {
          name: 'frontend',
          type: 'folder',
          children: [
            {
              name: 'src',
              type: 'folder',
              children: [
                {
                  name: 'components',
                  type: 'folder',
                  children: [
                    { name: 'DocumentUpload.jsx', type: 'file' },
                    { name: 'AnalysisDashboard.jsx', type: 'file' },
                    { name: 'ReportViewer.jsx', type: 'file' }
                  ]
                }
              ]
            }
          ]
        },
        { name: 'data', type: 'folder', children: [{ name: 'sample_patents', type: 'folder' }] },
        { name: 'docker-compose.yml', type: 'file' },
        { name: 'README.md', type: 'file' }
      ]
    }
  },
  {
    title: 'Dual-Mode Plagiarism Detection System',
    slug: 'plagiarism-detection',
    tagline: 'NLP + computer vision dual-agent system for structural and visual content overlap detection.',
    featured: false,
    stack: [
      'Python',
      'NLP',
      'Scikit-learn',
      'TF-IDF',
      'Cosine Similarity',
      'NumPy',
      'Pandas',
      'OpenCV',
      'Flask',
      'REST API'
    ],
    githubUrl: 'https://github.com/Anupk2002/Final-PlagDetect',
    overview: 'An academic plagiarism detection gateway coupling NLP text vectors with Computer Vision. It cross-compares documents not only on semantic phrasing structures but on logical diagrams, templates, and embedded image charts, delivering absolute indexing security.',
    features: [
      'Comprehensive NLP extraction framework analyzing documents using TF-IDF encoding, stopwords stripping, and Cosine Similarity computations.',
      'Robust Computer Vision feature extraction relying on OpenCV to align templates, evaluate visual structural similarities, and identify altered graphics.',
      'Flask-driven Restful microservice backend ensuring near-instant validation rates and robust endpoint processing.',
      'Fully presented and peer-reviewed published work featured in IEEE OTCON 24 research proceedings.'
    ],
    description: [
      'Built an end-to-end NLP pipeline for text plagiarism detection using TF-IDF vectorization, cosine similarity, and statistical text analysis; achieved high-precision document comparison across multiple file formats.',
      'Computer-vision-based image similarity check using OpenCV for the "dual-mode" detection.',
      'Deployed as a web application via Flask REST API; published and presented peer-reviewed research at IEEE OTCON 2024.'
    ],
    diagramNodes: [
      { id: '1', label: 'Inputs (Word/PDF/Photos)', type: 'source' },
      { id: '2', label: 'Dual Preprocessing Gateway', type: 'process' },
      { id: '3', label: 'NLP Branch: TF-IDF & Cosine Engine', type: 'process' },
      { id: '4', label: 'CV Branch: OpenCV Feature Matching', type: 'process' },
      { id: '5', label: 'Consolidated Weights Similarity Evaluator', type: 'database' },
      { id: '6', label: 'Flask REST API Backend', type: 'process' },
      { id: '7', label: 'Output Results Slate', type: 'output' }
    ],
    gitRepo: {
      name: 'Final-PlagDetect',
      type: 'folder',
      children: [
        { name: 'app.py', type: 'file' },
        {
          name: 'static',
          type: 'folder',
          children: [{ name: 'css', type: 'folder' }, { name: 'js', type: 'folder' }]
        },
        {
          name: 'templates',
          type: 'folder',
          children: [{ name: 'index.html', type: 'file' }, { name: 'results.html', type: 'file' }]
        },
        {
          name: 'core',
          type: 'folder',
          children: [
            { name: 'text_similarity.py', type: 'file' },
            { name: 'image_similarity.py', type: 'file' },
            { name: 'preprocessing.py', type: 'file' }
          ]
        },
        {
          name: 'utils',
          type: 'folder',
          children: [{ name: 'file_handler.py', type: 'file' }]
        },
        { name: 'requirements.txt', type: 'file' },
        { name: 'README.md', type: 'file' }
      ]
    }
  }
];

export const CERTIFICATIONS: Certification[] = [
  {
    title: 'Full Stack Data Science with AI (ML, NLP, Model Deployment)',
    issuer: 'Naresh i Technologies',
    date: 'Oct 2025 – Apr 2026',
    details: 'Comprehensive immersive masterclass covering Machine Learning architectures, deep NLP tokenizers, transformers, dynamic dashboard deployments, and distributed agentic frameworks.'
  },
  {
    title: 'Associate – IT Foundation Skills (Python)',
    issuer: 'Infosys Springboard',
    date: 'Aug 2024',
    details: 'Focused on advanced algorithmic programming structures, core python engineering practices, data patterns, and file integrations.'
  },
  {
    title: 'The Joy of Computing Using Python (Elite Certificate, 77%)',
    issuer: 'NPTEL IIT Madras',
    date: 'Jan – Apr 2023',
    details: 'Rigorous academic evaluation covering computing principles, search/sort optimization, recursion complexity, and analytical modules.'
  },
  {
    title: 'IR4.0 Foundation Program – AI & Machine Learning',
    issuer: 'TechSaksham & Edunet Foundation (Microsoft & SAP Initiative)',
    date: '2023',
    details: 'Hands-on enterprise technology workshops regarding modern statistical layouts, neural networks, and industrial ML implementations.'
  },
  {
    title: 'IoT Workshop',
    issuer: 'Innovians Technologies & Technex\'23, IIT Varanasi',
    date: 'Sept 2023',
    details: 'Hardware-software systems programming, sensor communications, distributed message brokers, and live logging.'
  }
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    title: 'IEEE OTCON 2024 Published Researcher',
    description: 'Authored, peer-reviewed, and presented an experimental research paper on dual-mode plagiarism detection using coupled NLP text frequencies and computer vision templates. Co-signed and officially recorded into the IEEE technical committee archives.',
    date: '2024'
  }
];

export const EDUCATION_HISTORY: Education[] = [
  {
    degree: 'B.Tech in Computer Science & Engineering',
    institution: 'MGM\'s College of Engineering, Nanded',
    period: '2021 – 2025',
    score: 'CGPA: 7.45'
  },
  {
    degree: 'Class XII (Science - Physics, Chemistry, Mathematics)',
    institution: 'Yeshwant Mahavidyalaya, Nanded',
    period: 'Completed 2021',
    score: 'Percentage: 90.17%'
  }
];

export const INTERESTS = [
  'Kaggle Competitions',
  'Competitive Programming (LeetCode)',
  'Algorithmic Problem Solving',
  'Open Source Contribution',
  'Traveling'
];
