import React, { useState, useEffect, useRef } from 'react';
import { 
  FiMail, FiGithub, FiLinkedin, FiMapPin,
  FiCode, FiDatabase, FiCloud, FiLayers, FiServer,
  FiBriefcase, FiAward, FiExternalLink, FiChevronDown, FiChevronUp,
  FiMessageCircle, FiSend, FiX, FiBookOpen, FiUser, FiCheckCircle
} from 'react-icons/fi';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, Tooltip 
} from 'recharts';
import './Portfolio.scss';

// Portfolio data based on resume
const portfolioData = {
  hero: {
    name: "Long Vu",
    title: "DevOps Engineer | Cloud Architect",
    subtitle: "Microsoft-certified DevOps Engineer Expert",
    location: "Based in Espoo, Finland",
    tagline: "Specialist in Infrastructure as Code, CI/CD Automation & Zero Trust Architectures"
  },
  contact: {
    email: "vuhailong224@gmail.com",
    phone: "+358 50 520 4650",
    linkedin: "linkedin.com/in/longvu224",
    github: "github.com/LongVu224"
  },
  skills: {
    cloudDevOps: [
      { name: "Azure (App Services, DevOps, Bicep)", level: 95 },
      { name: "Docker & AKS", level: 90 },
      { name: "Azure AD & Monitor", level: 88 },
      { name: "AWS (EC2, S3, IAM)", level: 75 }
    ],
    cicd: [
      { name: "Azure Pipelines (YAML)", level: 95 },
      { name: "GitHub Actions", level: 90 },
      { name: "Jenkins", level: 80 },
      { name: "Infrastructure as Code", level: 92 }
    ],
    programming: [
      { name: "TypeScript/JavaScript", level: 90 },
      { name: "Python", level: 85 },
      { name: "Node.js", level: 90 },
      { name: "Golang", level: 70 },
      { name: "React", level: 88 }
    ],
    databases: [
      { name: "PostgreSQL", level: 88 },
      { name: "MongoDB", level: 85 },
      { name: "SQL Server", level: 82 }
    ]
  },
  experience: [
    {
      id: 1,
      role: "DevOps Engineer",
      company: "InlineMarket Oy",
      location: "Helsinki, Finland",
      period: "March 2021 - Present",
      type: "Full-time",
      description: "Leading DevOps initiatives and cloud infrastructure management for enterprise applications.",
      highlights: [
        "CI/CD Optimization: Designed and implemented scalable Azure DevOps pipelines using YAML, reducing manual deployment efforts by 40% and increasing release frequency",
        "Infrastructure Automation: Managed cloud infrastructure using Bicep templates, ensuring environment consistency across Test, Development, Staging, and Production",
        "Reliability Engineering: Monitored Azure services (App Insights/Log Analytics), achieving 99.9% system uptime and identifying performance bottlenecks proactively",
        "Collaboration: Bridged Dev and Ops by containerizing legacy applications with Docker, streamlining local development-to-production workflow"
      ],
      technologies: ["Azure DevOps", "Bicep", "Docker", "App Insights", "Log Analytics", "AKS"]
    },
    {
      id: 2,
      role: "Software Developer",
      company: "Speys Oy",
      location: "Kirkkonummi, Finland",
      period: "May 2019 - July 2020",
      type: "Full-time",
      description: "Full-stack development with focus on cloud migration and database optimization.",
      highlights: [
        "Full-Stack Development: Engineered secure web applications using Node.js and React, contributing to the full SDLC",
        "Cloud Migration: Assisted in managing AWS infrastructure (EC2/S3), migrating on-premise data components to secure cloud environments",
        "Database Management: Optimized PostgreSQL queries and database schemas, improving application response times for high-concurrency user traffic"
      ],
      technologies: ["Node.js", "React", "AWS", "PostgreSQL", "EC2", "S3"]
    },
    {
      id: 3,
      role: "Full-Stack Developer (DUDE-Project)",
      company: "Centria UAS",
      location: "Kokkola, Finland",
      period: "March 2019 - May 2019",
      type: "Project",
      description: "Developed internal tools for local companies in an agile environment.",
      highlights: [
        "Developed internal tools for local companies using modern web frameworks",
        "Implemented automated testing suites to ensure code quality in a fast-paced agile environment"
      ],
      technologies: ["JavaScript", "React", "Testing Frameworks", "Agile"]
    }
  ],
  projects: [
    {
      id: 1,
      title: "Customer Analysis App",
      description: "Containerized microservices application deployed on Azure Container Apps with full CI/CD lifecycle.",
      image: null,
      technologies: ["Azure Container Apps", "Bicep", "Azure DevOps", "Docker", "React", "Node.js"],
      category: "DevOps",
      github: "https://github.com/LongVu224",
      demo: "#",
      highlights: [
        "Developed and deployed containerized microservices on Azure Container Apps using Bicep for Infrastructure as Code",
        "Engineered full CI/CD lifecycle in Azure DevOps, automating Docker image builds and multi-stage deployments",
        "Implemented password-less authentication between containers and Azure resources"
      ]
    },
    {
      id: 2,
      title: "Zero Trust Architecture Implementation",
      description: "Master's thesis project implementing Zero Trust security patterns with Microsoft Azure as the central hub.",
      image: null,
      technologies: ["Azure AD", "Conditional Access", "Azure Policy", "Key Vault", "Managed Identities"],
      category: "Security",
      github: null,
      demo: null,
      highlights: [
        "Designed and documented Zero Trust Architecture patterns for cloud environments",
        "Implemented identity-based security controls using Azure AD and Conditional Access",
        "Achieved Grade 4/5 for thesis at Oulu University of Applied Sciences"
      ]
    },
    {
      id: 3,
      title: "CI/CD Pipeline Automation",
      description: "Scalable deployment pipelines reducing manual efforts and improving release frequency.",
      image: null,
      technologies: ["Azure Pipelines", "YAML", "GitHub Actions", "Docker", "Kubernetes"],
      category: "DevOps",
      github: null,
      demo: null,
      highlights: [
        "Reduced manual deployment efforts by 40%",
        "Multi-environment deployment automation (Test, Dev, Staging, Production)",
        "Integrated monitoring and alerting with App Insights"
      ]
    }
  ],
  education: [
    {
      id: 1,
      degree: "Master of Engineering",
      field: "Modern Software and Computing Solutions",
      school: "Oulu University of Applied Sciences",
      period: "2025",
      gpa: "4.0/5.0",
      focus: ["Machine Learning", "Data Analysis", "Super Computing"],
      thesis: {
        title: "Zero Trust Architecture in the cloud: Microsoft Azure as a central hub",
        grade: "4/5"
      }
    },
    {
      id: 2,
      degree: "Bachelor of Engineering",
      field: "Information Technology",
      school: "Centria University of Applied Sciences",
      period: "2016 - 2020",
      gpa: null,
      focus: [],
      thesis: {
        title: "Deploying web app using Jenkins and Amazon Web Services",
        grade: "4/5"
      }
    }
  ],
  certifications: [
    { name: "DevOps Engineer Expert", issuer: "Microsoft Certified", year: "Nov 2022", badge: "AZ-400" },
    { name: "Azure Developer Associate", issuer: "Microsoft Certified", year: "Apr 2022", badge: "AZ-204" }
  ]
};

// FAQ data for chatbot
const faqData = [
  { 
    keywords: ["experience", "years", "work", "background"],
    answer: "I have 4+ years of experience in Azure cloud infrastructure and full-stack development. Currently working as a DevOps Engineer at InlineMarket Oy in Helsinki, where I've reduced deployment efforts by 40% and achieved 99.9% system uptime."
  },
  {
    keywords: ["skills", "technologies", "tech stack", "know"],
    answer: "I specialize in Azure (App Services, DevOps, Bicep, AKS), CI/CD automation with Azure Pipelines and GitHub Actions, and programming with TypeScript, Python, Node.js, and Golang. I'm also experienced with PostgreSQL, MongoDB, and Docker."
  },
  {
    keywords: ["project", "portfolio", "work on", "built"],
    answer: "My key projects include this Customer Analysis App (containerized on Azure Container Apps with Bicep IaC), Zero Trust Architecture implementation for my Master's thesis, and enterprise CI/CD pipeline automation. Check out the Projects section!"
  },
  {
    keywords: ["contact", "email", "reach", "hire", "available"],
    answer: "I'd love to connect! Email me at vuhailong224@gmail.com or connect on LinkedIn. I'm based in Espoo, Finland and open to discussing new opportunities."
  },
  {
    keywords: ["education", "degree", "study", "university", "thesis"],
    answer: "I have a Master's in Modern Software and Computing Solutions from Oulu UAS (GPA 4.0/5.0) with thesis on Zero Trust Architecture in Azure. I also hold a Bachelor's in IT from Centria UAS with thesis on deploying apps with Jenkins and AWS."
  },
  {
    keywords: ["azure", "cloud", "microsoft", "devops", "certification"],
    answer: "I'm Microsoft Certified DevOps Engineer Expert (AZ-400) and Azure Developer Associate (AZ-204). I work daily with Azure DevOps, Bicep, App Insights, Log Analytics, Container Apps, and implement Zero Trust security patterns."
  },
  {
    keywords: ["hello", "hi", "hey", "help"],
    answer: "Hello! I'm Long's portfolio assistant. I can tell you about my DevOps experience, Azure certifications, projects, education, or how to contact me. What would you like to know?"
  }
];

// Floating Chatbot Component
const ChatBot = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    { type: 'bot', text: "Hi! I'm Long's portfolio assistant. Ask me about skills, experience, projects, or how to get in touch!" }
  ]);
  const [input, setInput] = useState('');
  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const findAnswer = (query) => {
    const lowerQuery = query.toLowerCase();
    for (const faq of faqData) {
      if (faq.keywords.some(keyword => lowerQuery.includes(keyword))) {
        return faq.answer;
      }
    }
    return "I'm not sure about that. Try asking about my skills, experience, projects, or contact info!";
  };

  const handleSend = () => {
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { type: 'user', text: input }]);
    
    setTimeout(() => {
      const answer = findAnswer(input);
      setMessages(prev => [...prev, { type: 'bot', text: answer }]);
    }, 500);
    
    setInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  if (!isOpen) return null;

  return (
    <div className="chatbot">
      <div className="chatbot__header">
        <span className="chatbot__title">portfolio-assistant.js</span>
        <span className="dot dot--red chatbot__close" onClick={onClose}></span>
      </div>
      <div className="chatbot__messages" ref={messagesContainerRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`chatbot__message chatbot__message--${msg.type}`}>
            {msg.type === 'bot' && <span className="chatbot__prefix">{'>'} </span>}
            {msg.type === 'user' && <span className="chatbot__prefix">$ </span>}
            {msg.text}
          </div>
        ))}
      </div>
      <div className="chatbot__input">
        <span className="chatbot__prompt">$</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your question..."
        />
        <button onClick={handleSend}>
          <FiSend />
        </button>
      </div>
    </div>
  );
};

// Floating Chat Button
const ChatButton = ({ onClick, isOpen }) => (
  <button 
    className={`chat-fab ${isOpen ? 'chat-fab--active' : ''}`} 
    onClick={onClick}
    aria-label="Open chat"
  >
    {isOpen ? <FiX /> : <FiMessageCircle />}
  </button>
);

// Contact Form Component
// To use EmailJS, create a .env file in frontend/ with:
// REACT_APP_EMAILJS_SERVICE_ID=your_service_id
// REACT_APP_EMAILJS_TEMPLATE_ID=your_template_id
// REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key
const EMAILJS_SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

const ContactForm = ({ recipientEmail }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState('idle'); // idle, sending, sent, error

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    
    try {
      // Dynamic import of EmailJS to avoid bundling if not configured
      const emailjs = await import('@emailjs/browser');
      
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: formData.name,
          from_email: formData.email,
          subject: formData.subject,
          message: formData.message,
          to_email: recipientEmail,
        },
        EMAILJS_PUBLIC_KEY
      );
      
      setStatus('sent');
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // Reset to idle after showing success
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      console.error('EmailJS Error:', error);
      setStatus('error');
      
      // Reset to idle after showing error
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="contact-form__header">
        <div className="contact-form__dots">
          <span className="dot dot--yellow"></span>
          <span className="dot dot--green"></span>
        </div>
        <span className="contact-form__title">send-message.sh</span>
      </div>
      
      <div className="contact-form__body">
        <div className="contact-form__row">
          <div className="contact-form__field">
            <label>
              <FiUser />
              <span>Your Name</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </div>
          <div className="contact-form__field">
            <label>
              <FiMail />
              <span>Your Email</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              required
            />
          </div>
        </div>
        
        <div className="contact-form__field">
          <label>
            <FiMessageCircle />
            <span>Subject</span>
          </label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Let's work together!"
            required
          />
        </div>
        
        <div className="contact-form__field">
          <label>
            <FiCode />
            <span>Message</span>
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Hi Long, I'd like to discuss..."
            rows={5}
            required
          />
        </div>
        
        <button 
          type="submit" 
          className={`contact-form__submit ${status === 'sent' ? 'contact-form__submit--success' : ''} ${status === 'error' ? 'contact-form__submit--error' : ''}`}
          disabled={status === 'sending'}
        >
          {status === 'idle' && (
            <>
              <FiSend />
              <span>Send Message</span>
            </>
          )}
          {status === 'sending' && <span>Sending...</span>}
          {status === 'sent' && (
            <>
              <FiCheckCircle />
              <span>Message Sent!</span>
            </>
          )}
          {status === 'error' && (
            <>
              <FiX />
              <span>Failed - Try again</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

// Interactive Code Terminal for Hero Section
const CodeTerminal = () => {
  const [displayedLines, setDisplayedLines] = useState([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  const codeLines = [
    { type: 'comment', text: '// Azure DevOps Engineer Portfolio' },
    { type: 'code', text: 'const engineer = {' },
    { type: 'property', text: '  name: "Long Vu",' },
    { type: 'property', text: '  role: "DevOps Engineer",' },
    { type: 'property', text: '  certs: ["AZ-400", "AZ-204"],' },
    { type: 'property', text: '  stack: ["Azure", "Bicep", "Docker"],' },
    { type: 'code', text: '};' },
    { type: 'empty', text: '' },
    { type: 'code', text: 'az pipeline run --name "deploy"' },
    { type: 'output', text: '→ Pipeline triggered...' },
    { type: 'success', text: '✓ Deployment successful!' },
  ];

  useEffect(() => {
    if (!isTyping) return;
    
    if (currentLineIndex >= codeLines.length) {
      setIsTyping(false);
      return;
    }

    const currentLine = codeLines[currentLineIndex];
    
    if (currentCharIndex <= currentLine.text.length) {
      const timer = setTimeout(() => {
        if (currentCharIndex === currentLine.text.length) {
          // Line complete, move to next
          setDisplayedLines(prev => [...prev, { ...currentLine, text: currentLine.text }]);
          setCurrentLineIndex(prev => prev + 1);
          setCurrentCharIndex(0);
        } else {
          setCurrentCharIndex(prev => prev + 1);
        }
      }, currentLine.type === 'empty' ? 100 : 30);
      
      return () => clearTimeout(timer);
    }
  }, [currentLineIndex, currentCharIndex, isTyping, codeLines]);

  const getCurrentTypingText = () => {
    if (currentLineIndex >= codeLines.length) return '';
    return codeLines[currentLineIndex].text.substring(0, currentCharIndex);
  };

  return (
    <div className="code-terminal">
      <div className="code-terminal__header">
        <span className="code-terminal__title">developer.js</span>
      </div>
      <div className="code-terminal__body">
        {displayedLines.map((line, idx) => (
          <div key={idx} className={`code-line code-line--${line.type}`}>
            <span className="code-line__number">{idx + 1}</span>
            <span className="code-line__content">{line.text}</span>
          </div>
        ))}
        {isTyping && currentLineIndex < codeLines.length && (
          <div className={`code-line code-line--${codeLines[currentLineIndex].type}`}>
            <span className="code-line__number">{displayedLines.length + 1}</span>
            <span className="code-line__content">
              {getCurrentTypingText()}
              <span className="cursor">|</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// Skills Radar Chart Data
const getRadarData = () => {
  return [
    { subject: 'Azure/Cloud', value: 95, fullMark: 100 },
    { subject: 'CI/CD', value: 92, fullMark: 100 },
    { subject: 'IaC (Bicep)', value: 90, fullMark: 100 },
    { subject: 'Containers', value: 88, fullMark: 100 },
    { subject: 'Programming', value: 85, fullMark: 100 },
    { subject: 'Databases', value: 85, fullMark: 100 }
  ];
};

// Custom Tooltip for Radar Chart
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="radar-tooltip">
        <p>{payload[0].payload.subject}: <strong>{payload[0].value}%</strong></p>
      </div>
    );
  }
  return null;
};

// Section wrapper with animation
const Section = ({ id, className, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      id={id}
      ref={sectionRef} 
      className={`portfolio-section ${className} ${isVisible ? 'visible' : ''}`}
    >
      {children}
    </section>
  );
};

// Main Portfolio Component
const Portfolio = () => {
  const [expandedExp, setExpandedExp] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [chatOpen, setChatOpen] = useState(false);

  const { hero, contact, skills, experience, projects, education, certifications } = portfolioData;

  const categories = ['All', ...new Set(projects.map(p => p.category))];
  const filteredProjects = activeCategory === 'All' 
    ? projects 
    : projects.filter(p => p.category === activeCategory);

  return (
    <div className="portfolio">
      {/* Background Orbs */}
      <div className="portfolio-bg">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      {/* Hero Section */}
      <Section id="hero" className="hero-section">
        <div className="container">
          <div className="hero">
            <div className="hero__content">
              <div className="hero__badge">Available for opportunities</div>
              <h1 className="hero__name">{hero.name}</h1>
              <h2 className="hero__title">{hero.title}</h2>
              <p className="hero__subtitle">{hero.subtitle}</p>
              <p className="hero__tagline">{hero.tagline}</p>
              
              <div className="hero__location">
                <FiMapPin />
                <span>{hero.location}</span>
              </div>

              <div className="hero__actions">
                <a href="#contact" className="btn btn--primary">
                  Get in Touch
                </a>
                <a href="#projects" className="btn btn--secondary">
                  View Projects
                </a>
              </div>

              <div className="hero__social">
                <a href={`mailto:${contact.email}`} aria-label="Email">
                  <FiMail />
                </a>
                <a href={`https://${contact.github}`} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                  <FiGithub />
                </a>
                <a href={`https://${contact.linkedin}`} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <FiLinkedin />
                </a>
              </div>
            </div>

            {/* Interactive Code Terminal */}
            <div className="hero__terminal">
              <CodeTerminal />
            </div>
          </div>
        </div>
      </Section>

      {/* Skills Section */}
      <Section id="skills" className="skills-section">
        <div className="container">
          <h2 className="section-title">
            <FiCode />
            Skills & Expertise
          </h2>
          <div className="title-accent"></div>

          <div className="skills">
            <div className="skills__radar">
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={getRadarData()}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                  />
                  <PolarRadiusAxis 
                    angle={30} 
                    domain={[0, 100]} 
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
                  />
                  <Radar
                    name="Skills"
                    dataKey="value"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.3}
                  />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="skills__categories">
              {/* Cloud & DevOps */}
              <div className="skill-category">
                <div className="skill-category__header">
                  <FiCloud />
                  <h3>Cloud & DevOps</h3>
                </div>
                <div className="skill-category__items">
                  {skills.cloudDevOps.map((skill, idx) => (
                    <div key={idx} className="skill-item">
                      <div className="skill-item__info">
                        <span>{skill.name}</span>
                        <span>{skill.level}%</span>
                      </div>
                      <div className="skill-item__bar">
                        <div 
                          className="skill-item__progress" 
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CI/CD & Automation */}
              <div className="skill-category">
                <div className="skill-category__header">
                  <FiServer />
                  <h3>CI/CD & Automation</h3>
                </div>
                <div className="skill-category__items">
                  {skills.cicd.map((skill, idx) => (
                    <div key={idx} className="skill-item">
                      <div className="skill-item__info">
                        <span>{skill.name}</span>
                        <span>{skill.level}%</span>
                      </div>
                      <div className="skill-item__bar">
                        <div 
                          className="skill-item__progress skill-item__progress--secondary" 
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Programming */}
              <div className="skill-category">
                <div className="skill-category__header">
                  <FiLayers />
                  <h3>Programming</h3>
                </div>
                <div className="skill-category__items">
                  {skills.programming.map((skill, idx) => (
                    <div key={idx} className="skill-item">
                      <div className="skill-item__info">
                        <span>{skill.name}</span>
                        <span>{skill.level}%</span>
                      </div>
                      <div className="skill-item__bar">
                        <div 
                          className="skill-item__progress skill-item__progress--accent" 
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Databases */}
              <div className="skill-category">
                <div className="skill-category__header">
                  <FiDatabase />
                  <h3>Databases</h3>
                </div>
                <div className="skill-category__items">
                  {skills.databases.map((skill, idx) => (
                    <div key={idx} className="skill-item">
                      <div className="skill-item__info">
                        <span>{skill.name}</span>
                        <span>{skill.level}%</span>
                      </div>
                      <div className="skill-item__bar">
                        <div 
                          className="skill-item__progress skill-item__progress--success" 
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Experience Section */}
      <Section id="experience" className="experience-section">
        <div className="container">
          <h2 className="section-title">
            <FiBriefcase />
            Work Experience
          </h2>
          <div className="title-accent"></div>

          <div className="timeline">
            {experience.map((exp, idx) => (
              <div 
                key={exp.id} 
                className={`timeline-item ${expandedExp === exp.id ? 'expanded' : ''}`}
              >
                <div className="timeline-item__marker">
                  <div className="timeline-item__dot" />
                  {idx < experience.length - 1 && <div className="timeline-item__line" />}
                </div>
                
                <div className="timeline-item__content">
                  <div className="timeline-item__header" onClick={() => setExpandedExp(expandedExp === exp.id ? null : exp.id)}>
                    <div className="timeline-item__info">
                      <h3 className="timeline-item__role">{exp.role}</h3>
                      <p className="timeline-item__company">
                        {exp.company} • {exp.location}
                      </p>
                      <span className="timeline-item__period">{exp.period}</span>
                    </div>
                    <button className="timeline-item__toggle">
                      {expandedExp === exp.id ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                  </div>
                  
                  {expandedExp === exp.id && (
                    <div className="timeline-item__details">
                      <p className="timeline-item__description">{exp.description}</p>
                      <ul className="timeline-item__highlights">
                        {exp.highlights.map((highlight, hIdx) => (
                          <li key={hIdx}>{highlight}</li>
                        ))}
                      </ul>
                      <div className="timeline-item__tech">
                        {exp.technologies.map((tech, tIdx) => (
                          <span key={tIdx} className="tech-tag">{tech}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Projects Section */}
      <Section id="projects" className="projects-section">
        <div className="container">
          <h2 className="section-title">
            <FiCode />
            Featured Projects
          </h2>
          <div className="title-accent"></div>

          <div className="projects-filter">
            {categories.map(cat => (
              <button
                key={cat}
                className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="projects-grid">
            {filteredProjects.map(project => (
              <div key={project.id} className="project-card">
                <div className="project-card__header">
                  <span className="project-card__category">{project.category}</span>
                  <div className="project-card__links">
                    {project.github && (
                      <a href={project.github} target="_blank" rel="noopener noreferrer">
                        <FiGithub />
                      </a>
                    )}
                    {project.demo && (
                      <a href={project.demo} target="_blank" rel="noopener noreferrer">
                        <FiExternalLink />
                      </a>
                    )}
                  </div>
                </div>
                
                <h3 className="project-card__title">{project.title}</h3>
                <p className="project-card__description">{project.description}</p>
                
                <ul className="project-card__highlights">
                  {project.highlights.map((h, idx) => (
                    <li key={idx}>{h}</li>
                  ))}
                </ul>
                
                <div className="project-card__tech">
                  {project.technologies.map((tech, idx) => (
                    <span key={idx} className="tech-tag">{tech}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Education Section */}
      <Section id="education" className="education-section">
        <div className="container">
          <h2 className="section-title">
            <FiBookOpen />
            Education
          </h2>
          <div className="title-accent"></div>

          <div className="education-grid">
            {education.map((edu) => (
              <div key={edu.id} className="education-card">
                <div className="education-card__header">
                  <div className="education-card__icon">
                    <FiBookOpen />
                  </div>
                  <span className="education-card__period">{edu.period}</span>
                </div>
                <h3 className="education-card__degree">{edu.degree}</h3>
                <p className="education-card__field">{edu.field}</p>
                <p className="education-card__school">{edu.school}</p>
                {edu.gpa && <p className="education-card__gpa">GPA: {edu.gpa}</p>}
                {edu.focus.length > 0 && (
                  <div className="education-card__focus">
                    <span className="label">Focus:</span> {edu.focus.join(', ')}
                  </div>
                )}
                {edu.thesis && (
                  <div className="education-card__thesis">
                    <span className="label">Thesis:</span> {edu.thesis.title}
                    <span className="grade">(Grade: {edu.thesis.grade})</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Certifications Section */}
      <Section id="certifications" className="certifications-section">
        <div className="container">
          <h2 className="section-title">
            <FiAward />
            Certifications
          </h2>
          <div className="title-accent"></div>

          <div className="certifications-grid">
            {certifications.map((cert, idx) => (
              <div key={idx} className="cert-card">
                <div className="cert-card__icon">
                  <FiAward />
                </div>
                <div className="cert-card__content">
                  <h3>{cert.name}</h3>
                  <p>{cert.issuer} • {cert.year}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Contact Section */}
      <Section id="contact" className="contact-section">
        <div className="container">
          <h2 className="section-title">
            <FiMail />
            Get In Touch
          </h2>
          <div className="title-accent"></div>
          
          <p className="contact-intro">
            I'm always open to discussing new opportunities, interesting projects, 
            or just having a chat about technology. Feel free to reach out!
          </p>

          <div className="contact-cards">
            <a href={`mailto:${contact.email}`} className="contact-card">
              <div className="contact-card__icon">
                <FiMail />
              </div>
              <div className="contact-card__content">
                <h3>Email</h3>
                <p>{contact.email}</p>
              </div>
            </a>

            <a href={`https://${contact.linkedin}`} target="_blank" rel="noopener noreferrer" className="contact-card">
              <div className="contact-card__icon contact-card__icon--linkedin">
                <FiLinkedin />
              </div>
              <div className="contact-card__content">
                <h3>LinkedIn</h3>
                <p>Connect with me</p>
              </div>
            </a>

            <a href={`https://${contact.github}`} target="_blank" rel="noopener noreferrer" className="contact-card">
              <div className="contact-card__icon contact-card__icon--github">
                <FiGithub />
              </div>
              <div className="contact-card__content">
                <h3>GitHub</h3>
                <p>View my code</p>
              </div>
            </a>
          </div>

          <div className="contact-form-wrapper">
            <h3 className="contact-form-title">Or send me a message directly</h3>
            <ContactForm recipientEmail={contact.email} />
          </div>
        </div>
      </Section>

      {/* Floating Chat */}
      <ChatButton onClick={() => setChatOpen(!chatOpen)} isOpen={chatOpen} />
      <ChatBot isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
};

export default Portfolio;
