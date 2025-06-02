import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Github, Linkedin, Mail, Code, Briefcase, User, Award, Layers, Phone, Play, Pause, RotateCcw, Music, Volume1, Volume2, VolumeX, Lightbulb, Info, Car, Footprints, Sparkles } from 'lucide-react'; // Added Sparkles for Gemini features

// --- Component: Header (Navigation) ---
// This component provides a simple navigation bar.
const Header = () => (
  <header className="fixed top-0 left-0 right-0 bg-white bg-opacity-90 backdrop-blur-sm shadow-md z-50 p-4">
    <div className="container mx-auto flex justify-between items-center">
      <a href="#hero" className="text-2xl font-bold text-gray-800 hover:text-purple-600 transition-colors duration-300">
        你的名字
      </a>
      <nav className="space-x-6">
        <a href="#about" className="text-gray-600 hover:text-purple-600 transition-colors duration-300 font-medium">关于我</a>
        <a href="#skills" className="text-gray-600 hover:text-purple-600 transition-colors duration-300 font-medium">技能</a>
        <a href="#projects" className="text-gray-600 hover:text-purple-600 transition-colors duration-300 font-medium">项目</a>
        <a href="#game-selection" className="text-gray-600 hover:text-purple-600 transition-colors duration-300 font-medium">小游戏</a> {/* Link to game selection */}
        <a href="#contact" className="text-gray-600 hover:text-purple-600 transition-colors duration-300 font-medium">联系</a>
      </nav>
    </div>
  </header>
);

// --- Component: Hero Section ---
// This section introduces the user with a profile picture, name, and a short bio.
const Hero = () => (
  <section id="hero" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 text-white p-4">
    <div className="container mx-auto flex flex-col md:flex-row items-center justify-center text-center md:text-left space-y-8 md:space-y-0 md:space-x-12">
      <div className="flex-shrink-0">
        <img
          src="https://placehold.co/200x200/FFFFFF/000000?text=你的头像" // Placeholder image for profile picture
          alt="你的头像"
          className="w-48 h-48 rounded-full border-4 border-white shadow-lg object-cover"
          onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/200x200/CCCCCC/333333?text=头像"; }}
        />
      </div>
      <div>
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4">
          你好，我是 <span className="text-yellow-300">你的名字</span>
        </h1>
        <p className="text-2xl md:text-3xl font-light mb-6">
          一位充满激情的 <span className="font-semibold">软件工程师</span>
        </p>
        <p className="text-lg md:text-xl max-w-2xl mx-auto md:mx-0">
          我热衷于构建高性能、用户友好的应用程序，并将创意转化为现实。
        </p>
        <div className="mt-8 flex justify-center md:justify-start space-x-6">
          <a
            href="#contact"
            className="px-8 py-3 bg-white text-purple-600 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg transform hover:scale-105"
          >
            联系我
          </a>
          <a
            href="https://github.com/yourusername" // Replace with your GitHub profile
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 border-2 border-white text-white rounded-full text-lg font-semibold hover:bg-white hover:text-purple-600 transition-all duration-300 shadow-lg transform hover:scale-105 flex items-center space-x-2"
          >
            <Github size={20} />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </div>
  </section>
);

// --- Component: About Me Section ---
// This section provides a more detailed introduction to the user.
const About = () => (
  <section id="about" className="py-20 bg-gray-50 p-4">
    <div className="container mx-auto text-center max-w-4xl">
      <h2 className="text-4xl font-bold text-gray-800 mb-12 relative pb-4">
        <span className="relative z-10">关于我</span>
        <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-purple-600 rounded-full"></span>
      </h2>
      <div className="flex flex-col md:flex-row items-center md:space-x-12">
        <div className="md:w-1/3 mb-8 md:mb-0 flex-shrink-0">
          <img
            src="https://placehold.co/300x300/E0BBE4/8E44AD?text=插图" // Placeholder for an illustrative image
            alt="关于我插图"
            className="rounded-2xl shadow-xl w-full h-auto object-cover"
            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/300x300/CCCCCC/333333?text=插图"; }}
          />
        </div>
        <div className="md:w-2/3 text-lg text-gray-700 leading-relaxed text-left">
          <p className="mb-4">
            我是一名软件工程师，拥有在[你的领域，例如：Web开发、移动应用、数据科学]领域[X]年的经验。我擅长[列出你的主要专长，例如：前端开发、后端系统设计、数据库管理]。
          </p>
          <p className="mb-4">
            我热衷于解决复杂问题，并不断学习新技术。在我的职业生涯中，我曾参与过[举例说明你参与过的项目类型，例如：电子商务平台、SaaS产品、数据分析工具]的开发。
          </p>
          <p>
            除了编码，我还喜欢[你的爱好，例如：阅读、徒步旅行、摄影]，这些爱好帮助我保持创造力和平衡。我期待能为有意义的项目贡献我的技能和热情。
          </p>
        </div>
      </div>
    </div>
  </section>
);

// --- Component: Skills Section ---
// This section lists the user's technical and soft skills.
const Skills = () => {
  const technicalSkills = [
    { id: 'js', name: 'JavaScript', icon: <Code size={24} className="text-blue-500" /> },
    { id: 'react', name: 'React', icon: <Code size={24} className="text-blue-400" /> },
    { id: 'nodejs', name: 'Node.js', icon: <Code size={24} className="text-green-500" /> },
    { id: 'python', name: 'Python', icon: <Code size={24} className="text-yellow-600" /> },
    { id: 'tailwind', name: 'Tailwind CSS', icon: <Code size={24} className="text-teal-500" /> },
    { id: 'git', name: 'Git & GitHub', icon: <Code size={24} className="text-gray-700" /> },
    { id: 'db', name: '数据库 (SQL/NoSQL)', icon: <Code size={24} className="text-orange-500" /> },
    { id: 'cloud', name: '云平台 (AWS/GCP)', icon: <Code size={24} className="text-red-500" /> },
  ];

  const softSkills = [
    { id: 'problem-solving', name: '问题解决', icon: <Award size={24} className="text-purple-500" /> },
    { id: 'teamwork', name: '团队合作', icon: <Award size={24} className="text-indigo-500" /> },
    { id: 'communication', name: '沟通能力', icon: <Award size={24} className="text-green-500" /> },
    { id: 'adaptability', name: '适应能力', icon: <Award size={24} className="text-yellow-500" /> },
  ];

  const [loadingSkillId, setLoadingSkillId] = useState(null); // State to track which skill is loading insights
  const [showSkillModal, setShowSkillModal] = useState(false); // State to control skill modal visibility
  const [currentSkillInsights, setCurrentSkillInsights] = useState(null); // State to store insights for the active skill

  /**
   * Calls the Gemini API to get enhanced insights for a given skill.
   * @param {string} skillName - The name of the skill.
   * @param {boolean} isAdvanced - Flag to indicate if advanced (2026 tech) insights are requested.
   */
  const getSkillInsights = async (skillName, isAdvanced = false) => {
    setLoadingSkillId(skillName); // Set loading state for the specific skill
    setCurrentSkillInsights(null); // Clear previous insights
    setShowSkillModal(false); // Hide modal initially

    try {
      let prompt;
      if (isAdvanced) {
        prompt = `你是一个专业的未来技能解释器，能够模拟2026年'Gemini Vision Pro'的强大能力。请根据以下技能名称，生成对其的详细解释，说明其在未来（2026年及以后）的重要性，并描述'Gemini Vision Pro'如何能够为该技能提供**交互式模拟、3D 可视化或实时代码辅助**。请以JSON格式返回结果，包含 'skillName' (string), 'explanation' (string), 'futureImportance' (string), 'geminiVisionProCapabilities' (array of strings) 字段。

技能名称: ${skillName}`;
      } else {
        prompt = `你是一个专业的技能解释器。请根据以下技能名称，生成对其的详细解释，说明其重要性，并列出一些相关的概念或技术。请以JSON格式返回结果，包含 'skillName' (string), 'explanation' (string), 'importance' (string), 'relatedConcepts' (array of strings) 字段。

技能名称: ${skillName}`;
      }


      let chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });

      const payload = {
        contents: chatHistory,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: isAdvanced ? {
            type: "OBJECT",
            properties: {
              "skillName": { "type": "STRING" },
              "explanation": { "type": "STRING" },
              "futureImportance": { "type": "STRING" },
              "geminiVisionProCapabilities": {
                "type": "ARRAY",
                "items": { "type": "STRING" }
              }
            },
            "propertyOrdering": ["skillName", "explanation", "futureImportance", "geminiVisionProCapabilities"]
          } : {
            type: "OBJECT",
            properties: {
              "skillName": { "type": "STRING" },
              "explanation": { "type": "STRING" },
              "importance": { "type": "STRING" },
              "relatedConcepts": {
                "type": "ARRAY",
                "items": { "type": "STRING" }
              }
            },
            "propertyOrdering": ["skillName", "explanation", "importance", "relatedConcepts"]
          }
        }
      };

      const apiKey = ""; // API key is automatically provided by the Canvas environment
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${errorData.error.message || response.statusText}`);
      }

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
        const json = result.candidates[0].content.parts[0].text;
        const parsedJson = JSON.parse(json);
        setCurrentSkillInsights(parsedJson);
        setShowSkillModal(true); // Show the modal with insights
      } else {
        console.error('Gemini API 返回了意外的结构或内容缺失。');
        alert('无法获取技能洞察。请稍后再试。');
      }
    } catch (err) {
      console.error('获取技能洞察时出错:', err);
      alert(`获取洞察失败: ${err.message}`);
    } finally {
      setLoadingSkillId(null); // Reset loading state
    }
  };


  return (
    <section id="skills" className="py-20 bg-white p-4">
      <div className="container mx-auto text-center max-w-4xl">
        <h2 className="text-4xl font-bold text-gray-800 mb-12 relative pb-4">
          <span className="relative z-10">我的技能</span>
          <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-purple-600 rounded-full"></span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Technical Skills */}
          <div className="bg-gray-100 p-8 rounded-2xl shadow-lg">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center justify-center">
              <Code className="mr-3 text-purple-600" /> 技术技能
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {technicalSkills.map((skill) => (
                <div key={skill.id} className="flex flex-col items-center p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                  {skill.icon}
                  <p className="mt-2 text-gray-700 font-medium">{skill.name}</p>
                  <button
                    onClick={() => getSkillInsights(skill.name, true)} // Request advanced insights
                    disabled={loadingSkillId === skill.name}
                    className={`
                      mt-3 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 flex items-center space-x-1
                      ${loadingSkillId === skill.name
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'bg-blue-400 text-white hover:bg-blue-500 shadow-sm'
                      }
                    `}
                  >
                    {loadingSkillId === skill.name ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white"></div>
                        <span>加载中...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} /> {/* Changed icon to Sparkles */}
                        <span>✨ 获取深度洞察 (Gemini Vision Pro)</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Soft Skills */}
          <div className="bg-gray-100 p-8 rounded-2xl shadow-lg">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center justify-center">
              <User className="mr-3 text-purple-600" /> 软技能
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {softSkills.map((skill) => (
                <div key={skill.id} className="flex flex-col items-center p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                  {skill.icon}
                  <p className="mt-2 text-gray-700 font-medium">{skill.name}</p>
                  <button
                    onClick={() => getSkillInsights(skill.name, true)} // Request advanced insights
                    disabled={loadingSkillId === skill.name}
                    className={`
                      mt-3 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 flex items-center space-x-1
                      ${loadingSkillId === skill.name
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'bg-blue-400 text-white hover:bg-blue-500 shadow-sm'
                      }
                    `}
                  >
                    {loadingSkillId === skill.name ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white"></div>
                        <span>加载中...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} /> {/* Changed icon to Sparkles */}
                        <span>✨ 获取深度洞察 (Gemini Vision Pro)</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Skill Insights Modal */}
      {showSkillModal && currentSkillInsights && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full relative">
            <button
              onClick={() => setShowSkillModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold"
            >
              &times;
            </button>
            <h3 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
              <Sparkles className="mr-3 text-purple-600" /> {currentSkillInsights.skillName} 深度解析 (Gemini Vision Pro)
            </h3>

            <div className="space-y-6 text-left">
              <div>
                <h4 className="text-xl font-semibold text-purple-700 mb-2">解释:</h4>
                <p className="text-gray-700 leading-relaxed">{currentSkillInsights.explanation}</p>
              </div>
              {currentSkillInsights.futureImportance && (
                <div>
                  <h4 className="text-xl font-semibold text-purple-700 mb-2">未来重要性:</h4>
                  <p className="text-gray-700 leading-relaxed">{currentSkillInsights.futureImportance}</p>
                </div>
              )}
              {currentSkillInsights.geminiVisionProCapabilities && currentSkillInsights.geminiVisionProCapabilities.length > 0 && (
                <div>
                  <h4 className="text-xl font-semibold text-purple-700 mb-2">Gemini Vision Pro 能力模拟:</h4>
                  <ul className="list-disc list-inside text-gray-700">
                    {currentSkillInsights.geminiVisionProCapabilities.map((capability, index) => (
                      <li key={index}>{capability}</li>
                    ))}
                  </ul>
                </div>
              )}
              {currentSkillInsights.relatedConcepts && currentSkillInsights.relatedConcepts.length > 0 && (
                <div>
                  <h4 className="text-xl font-semibold text-purple-700 mb-2">相关概念:</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentSkillInsights.relatedConcepts.map((concept, index) => (
                      <span key={index} className="bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full">
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

// --- Component: Projects Section ---
// This section showcases the user's projects.
const Projects = () => {
  const projects = [
    {
      id: 'project1',
      title: '智能任务管理器',
      description: '一个基于React和Node.js的全栈任务管理应用，支持用户认证、任务分类和优先级设置。',
      technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS'],
      githubLink: 'https://github.com/yourusername/project1', // Replace with actual link
      liveDemoLink: '#', // Replace with actual link or remove if not applicable
      image: 'https://placehold.co/400x250/A0C4FF/333333?text=项目一',
    },
    {
      id: 'project2',
      title: '数据可视化仪表盘',
      description: '使用D3.js和React构建的交互式仪表盘，用于展示销售数据趋势和用户行为分析。',
      technologies: ['React', 'D3.js', 'Python (Flask)', 'PostgreSQL'],
      githubLink: 'https://github.com/yourusername/project2',
      liveDemoLink: '#',
      image: 'https://placehold.co/400x250/FFC7A0/333333?text=项目二',
    },
    {
      id: 'project3',
      title: '移动端食谱应用',
      description: '一个使用React Native开发的跨平台食谱应用，提供食谱搜索、收藏和购物清单功能。',
      technologies: ['React Native', 'Firebase', 'Redux'],
      githubLink: 'https://github.com/yourusername/project3',
      liveDemoLink: '#',
      image: 'https://placehold.co/400x250/C0F4C0/333333?text=项目三',
    },
  ];

  const [loadingProjectId, setLoadingProjectId] = useState(null); // State to track which project is loading insights
  const [showInsightsModal, setShowInsightsModal] = useState(false); // State to control modal visibility
  const [currentProjectInsights, setCurrentProjectInsights] = useState(null); // State to store insights for the active project

  /**
   * Calls the Gemini API to get enhanced insights for a given project.
   * @param {string} projectId - The ID of the project.
   * @param {string} projectTitle - The title of the project.
   * @param {string} projectDescription - The description of the project.
   * @param {string[]} projectTechnologies - The technologies used in the project.
   * @param {boolean} isAdvanced - Flag to indicate if advanced (2026 tech) insights are requested.
   */
  const getProjectInsights = async (projectId, projectTitle, projectDescription, projectTechnologies, isAdvanced = false) => {
    setLoadingProjectId(projectId); // Set loading state for the specific project
    setCurrentProjectInsights(null); // Clear previous insights
    setShowInsightsModal(false); // Hide modal initially

    try {
      let prompt;
      let responseSchema;

      if (isAdvanced) {
        prompt = `你是一个专业的未来项目分析师，能够模拟2026年'Gemini Vision Pro'的强大能力。请根据以下项目信息，生成一个更具吸引力的未来化项目描述，提供一些基于2026年技术的未来改进建议，并描述'Gemini Vision Pro'如何能够为该项目提供**动态项目演示、架构可视化或个性化功能扩展建议**。请以JSON格式返回结果，包含 'enhancedDescription' (string), 'futureImprovements' (array of strings), 'geminiVisionProCapabilities' (array of strings), 'futureKeywords' (array of strings) 字段。

项目标题: ${projectTitle}
项目描述: ${projectDescription}
使用技术: ${projectTechnologies.join(', ')}`;

        responseSchema = {
          type: "OBJECT",
          properties: {
            "enhancedDescription": { "type": "STRING" },
            "futureImprovements": { "type": "ARRAY", "items": { "type": "STRING" } },
            "geminiVisionProCapabilities": { "type": "ARRAY", "items": { "type": "STRING" } },
            "futureKeywords": { "type": "ARRAY", "items": { "type": "STRING" } }
          },
          "propertyOrdering": ["enhancedDescription", "futureImprovements", "geminiVisionProCapabilities", "futureKeywords"]
        };
      } else {
        prompt = `你是一个专业的项目描述优化器。请根据以下项目信息，生成一个更具吸引力的项目描述，并提供一些未来改进的建议，以及相关的SEO关键词。请以JSON格式返回结果，包含 'enhancedDescription' (string), 'futureImprovements' (array of strings), 'keywords' (array of strings) 字段。

项目标题: ${projectTitle}
项目描述: ${projectDescription}`;

        responseSchema = {
          type: "OBJECT",
          properties: {
            "enhancedDescription": { "type": "STRING" },
            "futureImprovements": {
              "type": "ARRAY",
              "items": { "type": "STRING" }
            },
            "keywords": {
              "type": "ARRAY",
              "items": { "type": "STRING" }
            }
          },
          "propertyOrdering": ["enhancedDescription", "futureImprovements", "keywords"]
        };
      }

      let chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });

      const payload = {
        contents: chatHistory,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: responseSchema
        }
      };

      const apiKey = ""; // API key is automatically provided by the Canvas environment
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${errorData.error.message || response.statusText}`);
      }

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
        const json = result.candidates[0].content.parts[0].text;
        const parsedJson = JSON.parse(json);
        setCurrentProjectInsights(parsedJson);
        setShowInsightsModal(true); // Show the modal with insights
      } else {
        console.error('Gemini API 返回了意外的结构或内容缺失。');
        alert('无法获取项目洞察。请稍后再试。');
      }
    } catch (err) {
      console.error('获取项目洞察时出错:', err);
      alert(`获取洞察失败: ${err.message}`);
    } finally {
      setLoadingProjectId(null); // Reset loading state
    }
  };

  return (
    <section id="projects" className="py-20 bg-gray-50 p-4">
      <div className="container mx-auto text-center max-w-5xl">
        <h2 className="text-4xl font-bold text-gray-800 mb-12 relative pb-4">
          <span className="relative z-10">我的项目</span>
          <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-purple-600 rounded-full"></span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-transform duration-300">
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-52 object-cover"
                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x250/CCCCCC/333333?text=项目图片"; }}
              />
              <div className="p-6">
                <h3 className="text-2xl font-semibold text-gray-800 mb-3">{project.title}</h3>
                <p className="text-gray-600 mb-4 text-base">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.map((tech, techIndex) => (
                    <span key={techIndex} className="bg-purple-100 text-purple-700 text-sm font-medium px-3 py-1 rounded-full">
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="flex justify-center space-x-4 flex-wrap gap-4"> {/* Added flex-wrap and gap */}
                  <a
                    href={project.githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2 bg-gray-800 text-white rounded-full text-sm font-semibold hover:bg-gray-700 transition-colors duration-300 flex items-center space-x-2"
                  >
                    <Github size={18} />
                    <span>GitHub</span>
                  </a>
                  {project.liveDemoLink !== '#' && (
                    <a
                      href={project.liveDemoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors duration-300 flex items-center space-x-2"
                    >
                      <Layers size={18} />
                      <span>演示</span>
                    </a>
                  )}
                  <button
                    onClick={() => getProjectInsights(project.id, project.title, project.description, project.technologies, true)} // Request advanced insights
                    disabled={loadingProjectId === project.id}
                    className={`
                      px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center space-x-2
                      ${loadingProjectId === project.id
                        ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                        : 'bg-yellow-400 text-purple-800 hover:bg-yellow-300 shadow-md transform hover:scale-105'
                      }
                    `}
                  >
                    {loadingProjectId === project.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-purple-800"></div>
                        <span>生成中...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} /> {/* Changed icon to Sparkles */}
                        <span>✨ 生成项目模拟 (Gemini Vision Pro)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Insights Modal */}
      {showInsightsModal && currentProjectInsights && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full relative">
            <button
              onClick={() => setShowInsightsModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold"
            >
              &times;
            </button>
            <h3 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
              <Sparkles className="mr-3 text-purple-600" /> 项目洞察 (Gemini Vision Pro)
            </h3>

            <div className="space-y-6 text-left">
              <div>
                <h4 className="text-xl font-semibold text-purple-700 mb-2">优化描述:</h4>
                <p className="text-gray-700 leading-relaxed">{currentProjectInsights.enhancedDescription}</p>
              </div>
              {currentProjectInsights.futureImprovements && currentProjectInsights.futureImprovements.length > 0 && (
                <div>
                  <h4 className="text-xl font-semibold text-purple-700 mb-2">未来改进建议:</h4>
                  <ul className="list-disc list-inside text-gray-700">
                    {currentProjectInsights.futureImprovements.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {currentProjectInsights.geminiVisionProCapabilities && currentProjectInsights.geminiVisionProCapabilities.length > 0 && (
                <div>
                  <h4 className="text-xl font-semibold text-purple-700 mb-2">Gemini Vision Pro 能力模拟:</h4>
                  <ul className="list-disc list-inside text-gray-700">
                    {currentProjectInsights.geminiVisionProCapabilities.map((capability, index) => (
                      <li key={index}>{capability}</li>
                    ))}
                  </ul>
                </div>
              )}
              {currentProjectInsights.futureKeywords && currentProjectInsights.futureKeywords.length > 0 && (
                <div>
                  <h4 className="text-xl font-semibold text-purple-700 mb-2">未来关键词:</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentProjectInsights.futureKeywords.map((keyword, index) => (
                      <span key={index} className="bg-blue-100 text-blue-700 text-sm font-medium px-3 py-1 rounded-full">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {currentProjectInsights.keywords && currentProjectInsights.keywords.length > 0 && (
                <div>
                  <h4 className="text-xl font-semibold text-purple-700 mb-2">关键词:</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentProjectInsights.keywords.map((keyword, index) => (
                      <span key={index} className="bg-blue-100 text-blue-700 text-sm font-medium px-3 py-1 rounded-full">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

// --- Component: RacingGame (Existing mini-game) ---
const RacingGame = ({ onGameEnd }) => {
  const gameAreaRef = useRef(null);
  const playerCarRef = useRef(null);
  const [carX, setCarX] = useState(50); // Car X position (percentage of game area width)
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [obstacles, setObstacles] = useState([]); // { id, x, y, width, height }
  const [storyMessage, setStoryMessage] = useState('');
  const [storyMilestone, setStoryMilestone] = useState(0); // Tracks progress in story

  const GAME_WIDTH = 300; // px
  const GAME_HEIGHT = 500; // px
  const CAR_WIDTH = 30; // px
  const CAR_HEIGHT = 50; // px
  const CAR_SPEED = 5; // Pixels per frame for horizontal movement
  const OBSTACLE_SPEED = 3; // Pixels per frame for vertical movement
  const OBSTACLE_MIN_WIDTH = 40;
  const OBSTACLE_MAX_WIDTH = 80;
  const OBSTACLE_MIN_HEIGHT = 40;
  const OBSTACLE_MAX_HEIGHT = 80;

  // Story milestones
  const storyPoints = useRef([
    { score: 0, message: '欢迎来到废土赛车！你的任务是穿越危险的废土，寻找传说中的能源核心。' },
    { score: 500, message: '前方是沙尘暴区，能见度极低！稳住方向盘，避开那些废弃的车辆！' },
    { score: 1500, message: '你成功穿越了沙尘暴！但能源核心的信号越来越弱，你需要更快！' },
    { score: 3000, message: '注意！你接近目标了！但赛道变得异常狭窄，考验你精准操控的时候到了！' },
    { score: 5000, message: '恭喜！你成功找到了能源核心，废土将重现生机！你赢了！' },
  ]);

  // Game loop
  const gameLoopRef = useRef(null);
  const lastFrameTimeRef = useRef(0);

  const updateGame = useCallback((currentTime) => {
    if (!gameStarted || gameOver) {
      return;
    }

    const deltaTime = currentTime - lastFrameTimeRef.current;
    lastFrameTimeRef.current = currentTime;

    // Update obstacles position
    setObstacles(prevObstacles => {
      const newObstacles = prevObstacles
        .map(obs => ({ ...obs, y: obs.y + OBSTACLE_SPEED }))
        .filter(obs => obs.y < GAME_HEIGHT + OBSTACLE_MAX_HEIGHT); // Remove off-screen obstacles
      return newObstacles;
    });

    // Generate new obstacles
    if (Math.random() < 0.03) { // Adjust probability for obstacle generation
      const newObstacle = {
        id: Math.random(),
        x: Math.random() * (GAME_WIDTH - OBSTACLE_MAX_WIDTH),
        y: -OBSTACLE_MAX_HEIGHT, // Start above the screen
        width: OBSTACLE_MIN_WIDTH + Math.random() * (OBSTACLE_MAX_WIDTH - OBSTACLE_MIN_WIDTH),
        height: OBSTACLE_MIN_HEIGHT + Math.random() * (OBSTACLE_MAX_HEIGHT - OBSTACLE_MIN_HEIGHT),
      };
      setObstacles(prev => [...prev, newObstacle]);
    }

    // Update score (based on time or distance)
    setScore(prevScore => prevScore + 1);

    // Check for story milestones
    const currentStoryPoint = storyPoints.current[storyMilestone]; // Corrected: Use storyPoints.current
    if (currentStoryPoint && score >= currentStoryPoint.score) {
      setStoryMessage(currentStoryPoint.message);
      setStoryMilestone(prev => prev + 1);
      // Clear message after a few seconds
      setTimeout(() => setStoryMessage(''), 5000);
    }

    // Collision detection
    const playerRect = {
      x: (carX / 100) * GAME_WIDTH, // Convert percentage to pixels
      y: GAME_HEIGHT - CAR_HEIGHT - 10, // Fixed Y position for car
      width: CAR_WIDTH,
      height: CAR_HEIGHT,
    };

    obstacles.forEach(obs => {
      const obstacleRect = {
        x: obs.x,
        y: obs.y,
        width: obs.width,
        height: obs.height,
      };

      if (
        playerRect.x < obstacleRect.x + obstacleRect.width &&
        playerRect.x + playerRect.width > obstacleRect.x &&
        playerRect.y < obstacleRect.y + obstacleRect.height &&
        playerRect.y + playerRect.height > obstacleRect.y
      ) {
        // Collision detected
        setGameOver(true);
        setGameStarted(false);
        setStoryMessage(`游戏结束！你撞到了障碍物。最终得分：${score}`);
        onGameEnd(); // Notify parent component
      }
    });

    gameLoopRef.current = requestAnimationFrame(updateGame);
  }, [gameStarted, gameOver, carX, score, obstacles, storyMilestone, onGameEnd]);

  // Handle keyboard input for car movement
  const handleKeyDown = useCallback((e) => {
    if (!gameStarted || gameOver) return;
    if (e.key === 'ArrowLeft') {
      setCarX(prevX => Math.max(0, prevX - (CAR_SPEED / GAME_WIDTH) * 100));
    } else if (e.key === 'ArrowRight') {
      setCarX(prevX => Math.min(100 - (CAR_WIDTH / GAME_WIDTH) * 100, prevX + (CAR_SPEED / GAME_WIDTH) * 100));
    }
  }, [gameStarted, gameOver]);

  // Handle touch input for car movement (simplified)
  const handleTouchMove = useCallback((e) => {
    if (!gameStarted || gameOver) return;
    const touchX = e.touches[0].clientX;
    const gameAreaLeft = gameAreaRef.current.getBoundingClientRect().left;
    const newCarX = ((touchX - gameAreaLeft) / GAME_WIDTH) * 100 - (CAR_WIDTH / GAME_WIDTH) * 50; // Center car on touch
    setCarX(Math.max(0, Math.min(100 - (CAR_WIDTH / GAME_WIDTH) * 100, newCarX)));
  }, [gameStarted, gameOver]);


  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchmove', handleTouchMove);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(gameLoopRef.current);
    };
  }, [handleKeyDown, handleTouchMove]);

  // Start/Restart game
  const startGame = () => {
    setCarX(50);
    setScore(0);
    setObstacles([]);
    setGameStarted(true);
    setGameOver(false);
    setStoryMessage(storyPoints.current[0].message); // Initial story message
    setStoryMilestone(1); // Move to next milestone
    lastFrameTimeRef.current = performance.now();
    gameLoopRef.current = requestAnimationFrame(updateGame);
  };

  useEffect(() => {
    if (gameStarted && !gameOver) {
      gameLoopRef.current = requestAnimationFrame(updateGame);
    } else {
      cancelAnimationFrame(gameLoopRef.current);
    }
    return () => cancelAnimationFrame(gameLoopRef.current);
  }, [gameStarted, gameOver, updateGame]);


  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-purple-300 flex flex-col items-center">
      <div className="flex justify-around items-center w-full mb-6 text-xl font-semibold text-gray-700">
        <p className="flex items-center">
          <Code className="mr-2 text-purple-600" /> 得分: <span className="text-purple-700 ml-2 text-2xl">{score}</span>
        </p>
      </div>

      {/* Game Area */}
      <div
        ref={gameAreaRef}
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
        className="relative bg-gray-700 overflow-hidden rounded-lg shadow-inner border-2 border-gray-900"
      >
        {/* Road Lines (animated) */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-600 animate-road-scroll">
          {/* Simulate road lines or texture */}
          <div className="absolute left-1/2 -ml-1 w-2 bg-white h-full opacity-50 animate-road-line-scroll"></div>
          <div className="absolute left-1/4 -ml-1 w-1 bg-white h-full opacity-30 animate-road-line-scroll"></div>
          <div className="absolute right-1/4 -ml-1 w-1 bg-white h-full opacity-30 animate-road-line-scroll"></div>
        </div>

        {/* Player Car */}
        <div
          ref={playerCarRef}
          style={{
            left: `${carX}%`,
            bottom: '10px',
            width: CAR_WIDTH,
            height: CAR_HEIGHT,
          }}
          className="absolute transform -translate-x-1/2 bg-blue-500 rounded-md shadow-lg flex items-center justify-center text-3xl z-10 transition-all duration-100 ease-linear"
        >
          🚗 {/* Car emoji */}
        </div>

        {/* Obstacles */}
        {obstacles.map(obs => (
          <div
            key={obs.id}
            style={{
              left: obs.x,
              top: obs.y,
              width: obs.width,
              height: obs.height,
              backgroundColor: 'rgba(255, 0, 0, 0.7)', // Red obstacle
            }}
            className="absolute rounded-md shadow-md flex items-center justify-center text-xl text-white"
          >
            🚧
          </div>
        ))}

        {/* Story Message Overlay */}
        {storyMessage && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-70 text-white p-4 rounded-lg text-center text-lg font-bold max-w-xs transition-opacity duration-500 opacity-100 z-20">
            {storyMessage}
          </div>
        )}

        {/* Game Over / Start Overlay */}
        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center text-white text-center p-4 z-30">
            <h3 className="text-3xl font-bold mb-4">废土赛车</h3>
            <p className="text-lg mb-6">驾驶你的战车，穿越废土，寻找能源核心！</p>
            <button
              onClick={startGame}
              className="px-8 py-3 bg-green-500 text-white rounded-full text-lg font-semibold hover:bg-green-600 transition-colors duration-300 shadow-lg transform hover:scale-105 flex items-center space-x-2"
            >
              <Play size={20} />
              <span>开始旅程</span>
            </button>
            <p className="mt-4 text-sm text-gray-300">使用左右箭头键或触摸屏幕移动</p>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center text-white text-center p-4 z-30">
            <h3 className="text-3xl font-bold mb-4">游戏结束！</h3>
            <p className="text-xl mb-4">最终得分: <span className="text-yellow-300">{score}</span></p>
            <p className="text-lg mb-6">
              {score >= 5000 ? storyPoints.current[storyPoints.current.length - 1].message : '你的旅程结束了。无论结果如何，你都展现了非凡的勇气！'}
            </p>
            <button
              onClick={startGame}
              className="px-8 py-3 bg-purple-500 text-white rounded-full text-lg font-semibold hover:bg-purple-600 transition-colors duration-300 shadow-lg transform hover:scale-105 flex items-center space-x-2"
            >
              <RotateCcw size={20} />
              <span>重新开始</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Component: PlatformerGame (New mini-game) ---
const PlatformerGame = ({ onGameEnd }) => {
  const gameAreaRef = useRef(null);
  const playerRef = useRef(null);
  const [playerPos, setPlayerPos] = useState({ x: 50, y: 0 }); // Player position (relative to game area bottom-left)
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [storyMessage, setStoryMessage] = useState('');
  const [storyMilestone, setStoryMilestone] = useState(0);

  // Game constants
  const GAME_WIDTH = 400;
  const GAME_HEIGHT = 300;
  const PLAYER_SIZE = 30;
  const JUMP_STRENGTH = 8;
  const GRAVITY = 0.4;
  const PLAYER_SPEED = 3;

  const [velocityY, setVelocityY] = useState(0);
  const [isOnGround, setIsOnGround] = useState(true);

  // Platforms: { id, x, y, width, height }
  const [platforms, setPlatforms] = useState([
    { id: 0, x: 0, y: 0, width: GAME_WIDTH, height: 20, type: 'ground' }, // Initial ground
  ]);
  const [obstacles, setObstacles] = useState([]); // { id, x, y, type }

  // Story points for platformer
  const platformerStoryPoints = useRef([
    { score: 0, message: '你好，小蘑菇！你迷失在神秘森林里，快找到回家的路吧！' },
    { score: 200, message: '前方有高高的平台，你需要精准跳跃才能通过！' },
    { score: 500, message: '小心那些不明生物！它们会阻碍你前进！' },
    { score: 1000, message: '你发现了一处古老的遗迹，家园就在不远处了！' },
    { score: 1500, message: '恭喜！你回到了温暖的家！蘑菇村的居民都在为你欢呼！' },
  ]);

  // Game loop
  const gameLoopRef = useRef(null);
  const lastFrameTimeRef = useRef(0);

  const updateGame = useCallback((currentTime) => {
    if (!gameStarted || gameOver) {
      return;
    }

    const deltaTime = (currentTime - lastFrameTimeRef.current) / 1000; // Convert to seconds
    lastFrameTimeRef.current = currentTime;

    setPlayerPos(prevPos => {
      let newY = prevPos.y + velocityY;
      let newX = prevPos.x;

      // Apply gravity
      setVelocityY(prevVelY => prevVelY - GRAVITY);

      // Check collision with platforms
      let collidedWithGround = false;
      platforms.forEach(platform => {
        // Simple AABB collision detection
        if (
          newX < platform.x + platform.width &&
          newX + PLAYER_SIZE > platform.x &&
          newY < platform.y + platform.height &&
          newY + PLAYER_SIZE > platform.y
        ) {
          // If falling and hit top of platform
          if (velocityY < 0 && prevPos.y >= platform.y + platform.height) {
            newY = platform.y + platform.height; // Snap to top of platform
            setVelocityY(0);
            collidedWithGround = true;
          }
        }
      });

      // Keep player within horizontal bounds
      newX = Math.max(0, Math.min(GAME_WIDTH - PLAYER_SIZE, newX));

      // Prevent falling through ground
      if (newY < 0) {
        newY = 0;
        setVelocityY(0);
        collidedWithGround = true;
      }
      setIsOnGround(collidedWithGround);

      return { x: newX, y: newY };
    });

    // Generate platforms and obstacles (simplified horizontal scrolling)
    setPlatforms(prevPlatforms => {
      const newPlatforms = prevPlatforms.map(p => ({ ...p, x: p.x - PLAYER_SPEED })); // Simulate scrolling
      // Add new platforms if needed
      if (newPlatforms[newPlatforms.length - 1].x < GAME_WIDTH - 100) { // If last platform is almost off-screen
        const lastPlatform = newPlatforms[newPlatforms.length - 1];
        const newPlatformX = lastPlatform.x + lastPlatform.width + Math.random() * 100 + 50; // Gap + min distance
        const newPlatformY = Math.max(0, Math.min(GAME_HEIGHT - 50, lastPlatform.y + (Math.random() - 0.5) * 50)); // Vary height
        newPlatforms.push({
          id: Math.random(),
          x: newPlatformX,
          y: newPlatformY,
          width: 80 + Math.random() * 100,
          height: 20,
          type: 'platform',
        });
      }
      return newPlatforms.filter(p => p.x + p.width > 0); // Remove off-screen platforms
    });

    setObstacles(prevObstacles => {
      const newObstacles = prevObstacles.map(o => ({ ...o, x: o.x - PLAYER_SPEED })); // Simulate scrolling
      // Add new obstacles
      if (Math.random() < 0.01 && score > 100) { // Add obstacles after some score
        const newObstacle = {
          id: Math.random(),
          x: GAME_WIDTH + Math.random() * 100, // Start off-screen
          y: 0, // Assume on ground for simplicity
          type: 'spike', // Example obstacle type
        };
        setObstacles(prev => [...prev, newObstacle]);
      }
      return newObstacles.filter(o => o.x + 30 > 0); // Remove off-screen obstacles (assuming obstacle width 30)
    });


    // Collision with obstacles
    obstacles.forEach(obs => {
      const obsRect = { x: obs.x, y: obs.y, width: 30, height: 30 }; // Assuming obstacle size
      const playerRect = { x: playerPos.x, y: playerPos.y, width: PLAYER_SIZE, height: PLAYER_SIZE };

      if (
        playerRect.x < obsRect.x + obsRect.width &&
        playerRect.x + playerRect.width > obsRect.x &&
        playerRect.y < obsRect.y + obsRect.height &&
        playerRect.y + playerRect.height > obsRect.y
      ) {
        setGameOver(true);
        setGameStarted(false);
        setStoryMessage(`游戏结束！你被障碍物击败了。最终得分：${score}`);
        onGameEnd();
      }
    });

    // Update score
    setScore(prevScore => prevScore + 1);

    // Check for story milestones
    const currentStoryPoint = platformerStoryPoints.current[storyMilestone];
    if (currentStoryPoint && score >= currentStoryPoint.score) {
      setStoryMessage(currentStoryPoint.message);
      setStoryMilestone(prev => prev + 1);
      setTimeout(() => setStoryMessage(''), 5000); // Clear message after 5 seconds
    }

    gameLoopRef.current = requestAnimationFrame(updateGame);
  }, [gameStarted, gameOver, playerPos, velocityY, isOnGround, platforms, obstacles, score, storyMilestone, onGameEnd]);

  // Handle keyboard input for player movement and jump
  const handleKeyDown = useCallback((e) => {
    if (!gameStarted || gameOver) return;
    if (e.key === 'ArrowLeft') {
      setPlayerPos(prevPos => ({ ...prevPos, x: prevPos.x - PLAYER_SPEED }));
    } else if (e.key === 'ArrowRight') {
      setPlayerPos(prevPos => ({ ...prevPos, x: prevPos.x + PLAYER_SPEED }));
    } else if (e.key === ' ' && isOnGround) { // Spacebar for jump
      setVelocityY(JUMP_STRENGTH);
      setIsOnGround(false);
    }
  }, [gameStarted, gameOver, isOnGround]);

  // Handle touch input (simplified: tap to jump, swipe left/right to move)
  const handleTouchStart = useCallback((e) => {
    if (!gameStarted || gameOver) return;
    const touchX = e.touches[0].clientX;
    const gameAreaRect = gameAreaRef.current.getBoundingClientRect();
    const relativeX = touchX - gameAreaRect.left;

    if (relativeX < GAME_WIDTH / 3) { // Left third of screen for left move
        setPlayerPos(prevPos => ({ ...prevPos, x: prevPos.x - PLAYER_SPEED * 10 })); // Larger move for tap
    } else if (relativeX > (GAME_WIDTH / 3) * 2) { // Right third of screen for right move
        setPlayerPos(prevPos => ({ ...prevPos, x: prevPos.x + PLAYER_SPEED * 10 })); // Larger move for tap
    } else if (isOnGround) { // Middle third for jump
        setVelocityY(JUMP_STRENGTH);
        setIsOnGround(false);
    }
  }, [gameStarted, gameOver, isOnGround]);


  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart); // For touch input
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      cancelAnimationFrame(gameLoopRef.current);
    };
  }, [handleKeyDown, handleTouchStart]);

  // Start/Restart game
  const startGame = () => {
    setPlayerPos({ x: 50, y: 0 });
    setScore(0);
    setGameStarted(true);
    setGameOver(false);
    setVelocityY(0);
    setIsOnGround(true);
    setPlatforms([{ id: 0, x: 0, y: 0, width: GAME_WIDTH, height: 20, type: 'ground' }]);
    setObstacles([]);
    setStoryMessage(platformerStoryPoints.current[0].message);
    setStoryMilestone(1);
    lastFrameTimeRef.current = performance.now();
    gameLoopRef.current = requestAnimationFrame(updateGame);
  };

  useEffect(() => {
    if (gameStarted && !gameOver) {
      gameLoopRef.current = requestAnimationFrame(updateGame);
    } else {
      cancelAnimationFrame(gameLoopRef.current);
    }
    return () => cancelAnimationFrame(gameLoopRef.current);
  }, [gameStarted, gameOver, updateGame]);

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-purple-300 flex flex-col items-center">
      <div className="flex justify-around items-center w-full mb-6 text-xl font-semibold text-gray-700">
        <p className="flex items-center">
          <Code className="mr-2 text-purple-600" /> 得分: <span className="text-purple-700 ml-2 text-2xl">{score}</span>
        </p>
      </div>

      {/* Game Area */}
      <div
        ref={gameAreaRef}
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
        className="relative bg-blue-200 overflow-hidden rounded-lg shadow-inner border-2 border-blue-900"
      >
        {/* Background elements (mountains, clouds) - simplified */}
        <div className="absolute w-full h-full bg-gradient-to-b from-blue-300 to-blue-100">
          <div className="absolute w-24 h-12 bg-gray-400 rounded-full top-1/4 left-1/4 opacity-50 animate-cloud-move"></div>
          <div className="absolute w-32 h-16 bg-gray-300 rounded-full top-1/3 right-1/3 opacity-50 animate-cloud-move-slow"></div>
          <div className="absolute w-20 h-10 bg-gray-500 rounded-full bottom-1/4 left-1/2 opacity-50 animate-cloud-move"></div>
        </div>

        {/* Platforms */}
        {platforms.map(platform => (
          <div
            key={platform.id}
            style={{
              left: platform.x,
              bottom: platform.y,
              width: platform.width,
              height: platform.height,
            }}
            className={`absolute ${platform.type === 'ground' ? 'bg-green-700' : 'bg-green-500'} rounded-md shadow-md`}
          ></div>
        ))}

        {/* Player Character */}
        <div
          ref={playerRef}
          style={{
            left: playerPos.x,
            bottom: playerPos.y,
            width: PLAYER_SIZE,
            height: PLAYER_SIZE,
          }}
          className="absolute bg-red-500 rounded-full flex items-center justify-center text-2xl z-10 transition-all duration-75 ease-linear"
        >
          🍄 {/* Mushroom emoji */}
        </div>

        {/* Obstacles */}
        {obstacles.map(obs => (
          <div
            key={obs.id}
            style={{
              left: obs.x,
              bottom: obs.y,
              width: 30,
              height: 30,
            }}
            className="absolute bg-gray-800 rounded-full flex items-center justify-center text-xl text-white"
          >
            🕷️ {/* Spider emoji */}
          </div>
        ))}

        {/* Story Message Overlay */}
        {storyMessage && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-70 text-white p-4 rounded-lg text-center text-lg font-bold max-w-xs transition-opacity duration-500 opacity-100 z-20">
            {storyMessage}
          </div>
        )}

        {/* Game Over / Start Overlay */}
        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center text-white text-center p-4 z-30">
            <h3 className="text-3xl font-bold mb-4">迷失蘑菇：家园之路</h3>
            <p className="text-lg mb-6">帮助小蘑菇跳跃和躲避障碍，找到回家的路！</p>
            <button
              onClick={startGame}
              className="px-8 py-3 bg-green-500 text-white rounded-full text-lg font-semibold hover:bg-green-600 transition-colors duration-300 shadow-lg transform hover:scale-105 flex items-center space-x-2"
            >
              <Play size={20} />
              <span>开始冒险</span>
            </button>
            <p className="mt-4 text-sm text-gray-300">使用左右箭头键移动，空格键跳跃</p>
            <p className="text-sm text-gray-300">触摸屏幕左/右侧移动，中间区域跳跃</p>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center text-white text-center p-4 z-30">
            <h3 className="text-3xl font-bold mb-4">游戏结束！</h3>
            <p className="text-xl mb-4">最终得分: <span className="text-yellow-300">{score}</span></p>
            <p className="text-lg mb-6">
              {score >= 1500 ? platformerStoryPoints.current[platformerStoryPoints.current.length - 1].message : '小蘑菇的旅程结束了。再试一次，帮助它回家！'}
            </p>
            <button
              onClick={startGame}
              className="px-8 py-3 bg-purple-500 text-white rounded-full text-lg font-semibold hover:bg-purple-600 transition-colors duration-300 shadow-lg transform hover:scale-105 flex items-center space-x-2"
            >
              <RotateCcw size={20} />
              <span>重新开始</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Component: GameSelection (New Component for choosing games) ---
const GameSelection = () => {
  const [selectedGame, setSelectedGame] = useState(null); // State to store the currently selected game ('racing' or 'platformer')
  const [loadingGameIdea, setLoadingGameIdea] = useState(false);
  const [generatedGameIdea, setGeneratedGameIdea] = useState(null);
  const [showGameIdeaModal, setShowGameIdeaModal] = useState(false);

  const handleGameSelect = (gameName) => {
    setSelectedGame(gameName);
  };

  const handleGameEnd = () => {
    setSelectedGame(null); // Go back to selection screen when a game ends
  };

  /**
   * Calls the Gemini API to generate a new game idea.
   */
  const generateNewGameIdea = async () => {
    setLoadingGameIdea(true);
    setGeneratedGameIdea(null);
    setShowGameIdeaModal(false);

    try {
      const prompt = `你是一个专业的游戏设计师，能够模拟2026年'Gemini Creative Synthesis'的极致创意能力。请为我设计一个全新的、基于网页的简单小游戏概念。这个游戏应该有独特的玩法、简单的剧情背景和吸引人的名称。请以JSON格式返回结果，包含 'gameName' (string), 'genre' (string), 'plotSummary' (string), 'gameplayMechanics' (array of strings), 'geminiCreativeSynthesisRole' (array of strings) 字段。

请确保游戏概念是原创且有趣的，并且适合作为个人网站上的迷你游戏。`;

      let chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });

      const payload = {
        contents: chatHistory,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              "gameName": { "type": "STRING" },
              "genre": { "type": "STRING" },
              "plotSummary": { "type": "STRING" },
              "gameplayMechanics": { "type": "ARRAY", "items": { "type": "STRING" } },
              "geminiCreativeSynthesisRole": { "type": "ARRAY", "items": { "type": "STRING" } }
            },
            "propertyOrdering": ["gameName", "genre", "plotSummary", "gameplayMechanics", "geminiCreativeSynthesisRole"]
          }
        }
      };

      const apiKey = ""; // API key is automatically provided by the Canvas environment
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${errorData.error.message || response.statusText}`);
      }

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
        const json = result.candidates[0].content.parts[0].text;
        const parsedJson = JSON.parse(json);
        setGeneratedGameIdea(parsedJson);
        setShowGameIdeaModal(true);
      } else {
        console.error('Gemini API 返回了意外的结构或内容缺失。');
        alert('无法生成新的游戏创意。请稍后再试。');
      }
    } catch (err) {
      console.error('生成游戏创意时出错:', err);
      alert(`生成创意失败: ${err.message}`);
    } finally {
      setLoadingGameIdea(false);
    }
  };


  return (
    <section id="game-selection" className="py-20 bg-gray-50 p-4 min-h-screen flex flex-col items-center justify-center">
      <div className="container mx-auto text-center max-w-4xl">
        <h2 className="text-4xl font-bold text-gray-800 mb-12 relative pb-4">
          <span className="relative z-10">选择你的小游戏</span>
          <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-purple-600 rounded-full"></span>
        </h2>

        {!selectedGame ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Racing Game Card */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-blue-300 transform hover:scale-105 transition-transform duration-300">
              <Car size={64} className="text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-3">废土赛车</h3>
              <p className="text-gray-600 mb-6">驾驶战车，在废土中寻找能源核心，躲避障碍！</p>
              <button
                onClick={() => handleGameSelect('racing')}
                className="px-8 py-3 bg-blue-500 text-white rounded-full text-lg font-semibold hover:bg-blue-600 transition-colors duration-300 shadow-lg"
              >
                开始废土赛车
              </button>
            </div>

            {/* Platformer Game Card */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-green-300 transform hover:scale-105 transition-transform duration-300">
              <Footprints size={64} className="text-green-600 mx-auto mb-4" /> {/* Changed icon to Footprints */}
              <h3 className="text-2xl font-bold text-gray-800 mb-3">迷失蘑菇：家园之路</h3>
              <p className="text-gray-600 mb-6">帮助小蘑菇跳跃和躲避障碍，找到回家的路！</p>
              <button
                onClick={() => handleGameSelect('platformer')}
                className="px-8 py-3 bg-green-500 text-white rounded-full text-lg font-semibold hover:bg-green-600 transition-colors duration-300 shadow-lg"
              >
                开始蘑菇冒险
              </button>
            </div>

            {/* Gemini Game Idea Generation */}
            <div className="md:col-span-2 bg-gradient-to-r from-purple-500 to-pink-500 p-8 rounded-2xl shadow-xl text-white flex flex-col items-center justify-center">
              <Sparkles size={64} className="text-yellow-300 mx-auto mb-4 animate-pulse" />
              <h3 className="text-2xl font-bold mb-3">极致创意：让 Gemini 生成新游戏创意！</h3>
              <p className="text-gray-100 mb-6 text-center">体验 2026 年 Gemini Creative Synthesis 的强大能力，为您即时生成独特的小游戏概念！</p>
              <button
                onClick={generateNewGameIdea}
                disabled={loadingGameIdea}
                className={`
                  px-8 py-3 rounded-full text-lg font-bold transition-all duration-300 shadow-lg transform hover:scale-105 flex items-center space-x-2
                  ${loadingGameIdea
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                    : 'bg-yellow-300 text-purple-800 hover:bg-yellow-200'
                  }
                `}
              >
                {loadingGameIdea ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-purple-800"></div>
                    <span>生成中...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    <span>生成新游戏创意</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-8">
            {selectedGame === 'racing' && <RacingGame onGameEnd={handleGameEnd} />}
            {selectedGame === 'platformer' && <PlatformerGame onGameEnd={handleGameEnd} />}
            <button
              onClick={() => setSelectedGame(null)}
              className="mt-8 px-6 py-3 bg-gray-600 text-white rounded-full text-lg font-semibold hover:bg-gray-700 transition-colors duration-300 shadow-lg flex items-center mx-auto space-x-2"
            >
              <RotateCcw size={20} />
              <span>返回游戏选择</span>
            </button>
          </div>
        )}
      </div>

      {/* Generated Game Idea Modal */}
      {showGameIdeaModal && generatedGameIdea && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full relative">
            <button
              onClick={() => setShowGameIdeaModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold"
            >
              &times;
            </button>
            <h3 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
              <Sparkles className="mr-3 text-purple-600" /> Gemini 生成的游戏创意
            </h3>

            <div className="space-y-6 text-left">
              <div>
                <h4 className="text-xl font-semibold text-purple-700 mb-2">游戏名称:</h4>
                <p className="text-gray-700 leading-relaxed">{generatedGameIdea.gameName}</p>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-purple-700 mb-2">类型:</h4>
                <p className="text-gray-700 leading-relaxed">{generatedGameIdea.genre}</p>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-purple-700 mb-2">剧情概述:</h4>
                <p className="text-gray-700 leading-relaxed">{generatedGameIdea.plotSummary}</p>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-purple-700 mb-2">玩法机制:</h4>
                <ul className="list-disc list-inside text-gray-700">
                  {generatedGameIdea.gameplayMechanics.map((mechanic, index) => (
                    <li key={index}>{mechanic}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-purple-700 mb-2">Gemini Creative Synthesis 在此扮演的角色:</h4>
                <ul className="list-disc list-inside text-gray-700">
                  {generatedGameIdea.geminiCreativeSynthesisRole.map((role, index) => (
                    <li key={index}>{role}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};


// --- Component: MusicPlayer ---
// This is a new component for the music player.
const MusicPlayer = () => {
  const audioRef = useRef(null); // Ref for the audio element
  const [isPlaying, setIsPlaying] = useState(false); // State to track play/pause
  const [volume, setVolume] = useState(0.5); // State for volume (0.0 to 1.0)

  // Toggle play/pause
  const togglePlayPause = async () => { // Made async to await play() promise
    if (audioRef.current.paused) {
      try {
        await audioRef.current.play(); // Await the play promise
        setIsPlaying(true);
      } catch (error) {
        // Handle the error, e.g., if play() was interrupted or user gesture was required
        console.error("Error attempting to play audio:", error);
        setIsPlaying(false); // Ensure state is consistent if play fails
      }
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Determine volume icon based on volume level
  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX size={20} />;
    if (volume < 0.5) return <Volume1 size={20} />;
    return <Volume2 size={20} />;
  };

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-xl shadow-2xl flex items-center space-x-4 z-50">
      <audio ref={audioRef} loop>
        {/*
          IMPORTANT: Replace this 'src' with your actual music file URL.
          Example: <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" type="audio/mpeg" />
          Ensure the URL is publicly accessible and you have rights to use the music.
        */}
        <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      <button
        onClick={togglePlayPause}
        className="p-2 rounded-full bg-purple-600 hover:bg-purple-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-300"
        aria-label={isPlaying ? '暂停音乐' : '播放音乐'}
      >
        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
      </button>

      <div className="flex items-center space-x-2">
        {getVolumeIcon()}
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="w-24 h-2 rounded-lg appearance-none cursor-pointer bg-gray-600 accent-purple-500"
          aria-label="音量控制"
        />
      </div>
      <Music size={24} className="text-purple-400" />
    </div>
  );
};


// --- Component: Contact Section ---
// This section provides ways for visitors to contact the user.
const Contact = () => (
  <section id="contact" className="py-20 bg-gradient-to-br from-purple-500 to-indigo-600 text-white p-4">
    <div className="container mx-auto text-center max-w-3xl">
      <h2 className="text-4xl font-bold mb-12 relative pb-4">
        <span className="relative z-10">联系我</span>
        <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-yellow-300 rounded-full"></span>
      </h2>
      <p className="text-lg mb-8">
        如果你对我的工作感兴趣，或者想讨论合作机会，请随时通过以下方式联系我：
      </p>

      <div className="flex flex-col md:flex-row justify-center items-center space-y-6 md:space-y-0 md:space-x-12">
        <a
          href="mailto:your.email@example.com" // Replace with your email
          className="flex items-center space-x-4 p-5 bg-white bg-opacity-20 rounded-2xl shadow-lg hover:bg-opacity-30 transition-all duration-300 transform hover:scale-105"
        >
          <Mail size={36} className="text-yellow-300" />
          <div>
            <p className="text-xl font-semibold">电子邮件</p>
            <p className="text-lg">your.email@example.com</p>
          </div>
        </a>
        <a
          href="https://www.linkedin.com/in/yourusername" // Replace with your LinkedIn profile
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-4 p-5 bg-white bg-opacity-20 rounded-2xl shadow-lg hover:bg-opacity-30 transition-all duration-300 transform hover:scale-105"
        >
          <Linkedin size={36} className="text-yellow-300" />
          <div>
            <p className="text-xl font-semibold">领英</p>
            <p className="text-lg">你的领英主页</p>
          </div>
        </a>
      </div>

      <div className="mt-12 p-6 bg-white bg-opacity-10 rounded-2xl shadow-inner">
        <p className="text-xl font-semibold mb-4">或者，给我留言：</p>
        <form className="space-y-4 text-left">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">姓名</label>
            <input
              type="text"
              id="name"
              name="name"
              className="w-full p-3 rounded-lg bg-white bg-opacity-90 text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-300"
              placeholder="你的名字"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">电子邮件</label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full p-3 rounded-lg bg-white bg-opacity-90 text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-300"
              placeholder="你的电子邮件"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-2">留言</label>
            <textarea
              id="message"
              name="message"
              rows="5"
              className="w-full p-3 rounded-lg bg-white bg-opacity-90 text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-300"
              placeholder="你的留言..."
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full px-6 py-3 bg-yellow-400 text-purple-800 rounded-full text-lg font-bold hover:bg-yellow-300 transition-colors duration-300 shadow-md transform hover:scale-105"
          >
            发送消息
          </button>
        </form>
        <p className="text-sm mt-4 text-gray-200">
          *注意：此表单为演示目的，不发送实际邮件。
        </p>
      </div>
    </div>
  </section>
);

// --- Component: Footer ---
// This component displays copyright information and quick links.
const Footer = () => (
  <footer className="bg-gray-800 text-white py-8 text-center p-4">
    <div className="container mx-auto">
      <p className="mb-4">&copy; {new Date().getFullYear()} 你的名字. 保留所有权利。</p>
      <div className="flex justify-center space-x-6">
        <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-300">
          <Github size={24} />
        </a>
        <a href="https://www.linkedin.com/in/yourusername" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-300">
          <Linkedin size={24} />

        </a>
        <a href="mailto:your.email@example.com" className="text-gray-400 hover:text-white transition-colors duration-300">
          <Mail size={24} />
        </a>
      </div>
    </div>
  </footer>
);

// --- Main App Component ---
// This is the main component that renders all sections of the website.
function App() {
  return (
    <div className="font-inter antialiased text-gray-800">
      {/* Tailwind CSS CDN is assumed to be available in the environment */}
      <style>
        {`
        /* Custom CSS for 3D flip effect */
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }

        /* Racing Game specific animations */
        @keyframes road-scroll {
          from { background-position: 0 0; }
          to { background-position: 0 100%; }
        }
        .animate-road-scroll {
          animation: road-scroll 1s linear infinite; /* Adjust speed as needed */
          background-size: 100% 200%; /* Make background larger to scroll smoothly */
        }

        @keyframes road-line-scroll {
          from { transform: translateY(0); }
          to { transform: translateY(100%); }
        }
        .animate-road-line-scroll {
          animation: road-line-scroll 1s linear infinite; /* Adjust speed as needed */
        }

        /* Platformer Game specific animations */
        @keyframes cloud-move {
          0% { transform: translateX(0); }
          50% { transform: translateX(20px); }
          100% { transform: translateX(0); }
        }
        .animate-cloud-move {
          animation: cloud-move 10s ease-in-out infinite;
        }
        @keyframes cloud-move-slow {
          0% { transform: translateX(0); }
          50% { transform: translateX(-30px); }
          100% { transform: translateX(0); }
        }
        .animate-cloud-move-slow {
          animation: cloud-move-slow 15s ease-in-out infinite;
        }
        `}
      </style>
      <Header />
      <main>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <GameSelection /> {/* Now using GameSelection component */}
        <Contact />
      </main>
      <Footer />
      <MusicPlayer />
    </div>
  );
}

export default App;
