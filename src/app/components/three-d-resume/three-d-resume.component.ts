import { 
  Component, 
  OnInit, 
  OnDestroy, 
  ViewChild, 
  ElementRef, 
  PLATFORM_ID, 
  Inject,
  ChangeDetectorRef,
  NgZone,
  signal
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';

interface TimelineEvent {
  id: string;
  title: string;
  company: string;
  period: string;
  description: string;
  position: THREE.Vector3;
  color: string;
  type: 'work' | 'education' | 'achievement';
}

interface Skill3D {
  id: string;
  name: string;
  level: number; // 0-100
  category: string;
  position: THREE.Vector3;
  color: string;
  mesh?: THREE.Mesh;
}

interface Project3D {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  image: string;
  position: THREE.Vector3;
  mesh?: THREE.Group;
}

@Component({
  selector: 'app-three-d-resume',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="three-d-resume-section py-20 relative overflow-hidden">
      <!-- 2025 Glassmorphism Background -->
      <div class="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 backdrop-blur-sm"></div>
      
      <!-- Floating Glass Elements -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute top-20 left-20 w-32 h-32 bg-white/5 rounded-3xl backdrop-blur-md border border-white/10 animate-float"></div>
        <div class="absolute bottom-32 right-32 w-24 h-24 bg-cyan-400/10 rounded-2xl backdrop-blur-md border border-cyan-400/20 animate-float" style="animation-delay: 2s;"></div>
        <div class="absolute top-1/2 left-10 w-16 h-16 bg-purple-400/10 rounded-xl backdrop-blur-md border border-purple-400/20 animate-float" style="animation-delay: 4s;"></div>
      </div>

      <div class="container mx-auto max-w-7xl px-6 relative z-10">
        <!-- Section Header -->
        <div class="text-center mb-16">
          <h2 class="text-5xl md:text-7xl font-bold mb-6 gradient-text">
            🌟 3D 交互式简历
          </h2>
          <p class="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            探索我的职业旅程、技能专长和项目作品，通过沉浸式3D体验了解我的专业背景
          </p>
        </div>

        <!-- 3D Navigation Controls -->
        <div class="flex justify-center mb-8">
          <div class="glass rounded-2xl p-4 flex gap-4">
            <button 
              (click)="switchView('timeline')"
              [class.active]="currentView() === 'timeline'"
              class="nav-btn px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105">
              📅 时间线
            </button>
            <button 
              (click)="switchView('skills')"
              [class.active]="currentView() === 'skills'"
              class="nav-btn px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105">
              🎯 技能图谱
            </button>
            <button 
              (click)="switchView('projects')"
              [class.active]="currentView() === 'projects'"
              class="nav-btn px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105">
              🚀 项目展示
            </button>
          </div>
        </div>

        <!-- 3D Canvas Container -->
        <div class="relative">
          <div class="glass rounded-3xl p-8 min-h-[600px] relative overflow-hidden">
            <!-- Three.js Canvas -->
            <canvas 
              #threeCanvas 
              class="w-full h-full rounded-2xl cursor-grab active:cursor-grabbing"
              style="min-height: 500px;">
            </canvas>
            
            <!-- Loading Indicator -->
            <div *ngIf="isLoading()" class="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-2xl">
              <div class="glass rounded-2xl p-8 text-center">
                <div class="animate-spin w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p class="text-white/80">正在加载3D场景...</p>
              </div>
            </div>

            <!-- Info Panel -->
            <div *ngIf="selectedItem()" class="absolute top-4 right-4 glass rounded-2xl p-6 max-w-sm">
              <h3 class="text-xl font-bold text-white mb-2">{{ selectedItem()?.title }}</h3>
              <p class="text-white/80 text-sm mb-3">{{ selectedItem()?.description }}</p>
              <div *ngIf="selectedItem()?.technologies" class="flex flex-wrap gap-2">
                <span *ngFor="let tech of selectedItem()?.technologies" 
                      class="px-2 py-1 bg-white/10 rounded-lg text-xs text-white/90">
                  {{ tech }}
                </span>
              </div>
            </div>
          </div>

          <!-- View Instructions -->
          <div class="mt-6 text-center">
            <div class="glass rounded-xl p-4 inline-block">
              <p class="text-white/70 text-sm">
                🖱️ 拖拽旋转视角 | 🔍 滚轮缩放 | 👆 点击交互元素
              </p>
            </div>
          </div>
        </div>

        <!-- Statistics Panel -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div class="glass rounded-2xl p-6 text-center">
            <div class="text-3xl font-bold text-cyan-400 mb-2">5+</div>
            <div class="text-white/80">年工作经验</div>
          </div>
          <div class="glass rounded-2xl p-6 text-center">
            <div class="text-3xl font-bold text-purple-400 mb-2">20+</div>
            <div class="text-white/80">核心技能</div>
          </div>
          <div class="glass rounded-2xl p-6 text-center">
            <div class="text-3xl font-bold text-green-400 mb-2">15+</div>
            <div class="text-white/80">完成项目</div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .gradient-text {
      background: linear-gradient(135deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57);
      background-size: 300% 300%;
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: gradientShift 4s ease-in-out infinite;
    }

    @keyframes gradientShift {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }

    .glass {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .nav-btn {
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .nav-btn.active {
      background: rgba(79, 172, 254, 0.3);
      border-color: rgba(79, 172, 254, 0.5);
      color: #4facfe;
    }

    .nav-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(180deg); }
    }

    .animate-float {
      animation: float 6s ease-in-out infinite;
    }
  `]
})
export class ThreeDResumeComponent implements OnInit, OnDestroy {
  @ViewChild('threeCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  // Platform check for SSR compatibility
  private isBrowser: boolean;

  // Signals for reactive state
  isLoading = signal(true);
  currentView = signal<'timeline' | 'skills' | 'projects'>('timeline');
  selectedItem = signal<any>(null);

  // Three.js objects
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls: any; // OrbitControls
  private raycaster!: THREE.Raycaster;
  private mouse!: THREE.Vector2;

  // Animation
  private animationId?: number;
  private clock!: THREE.Clock;

  // Data
  private timelineEvents: TimelineEvent[] = [];
  private skills3D: Skill3D[] = [];
  private projects3D: Project3D[] = [];

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.initializeData();
      this.initThreeJS();
    }
  }

  ngOnDestroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  private initializeData() {
    // Initialize timeline events
    this.timelineEvents = [
      {
        id: '1',
        title: '高级前端工程师',
        company: '科技创新公司',
        period: '2022-至今',
        description: '负责大型Web应用开发，技术栈包括Angular、React、Vue.js',
        position: new THREE.Vector3(-4, 2, 0),
        color: '#4facfe',
        type: 'work'
      },
      {
        id: '2',
        title: '前端开发工程师',
        company: '互联网公司',
        period: '2020-2022',
        description: '参与多个项目开发，积累丰富的前端开发经验',
        position: new THREE.Vector3(-2, 1, 0),
        color: '#00f2fe',
        type: 'work'
      },
      {
        id: '3',
        title: '计算机科学学士',
        company: '知名大学',
        period: '2016-2020',
        description: '主修计算机科学与技术，GPA 3.8/4.0',
        position: new THREE.Vector3(0, 0, 0),
        color: '#43e97b',
        type: 'education'
      },
      {
        id: '4',
        title: '全栈开发认证',
        company: '在线教育平台',
        period: '2021',
        description: '获得全栈开发专业认证，掌握前后端开发技能',
        position: new THREE.Vector3(2, 1, 0),
        color: '#38f9d7',
        type: 'achievement'
      },
      {
        id: '5',
        title: '技术团队负责人',
        company: '创业公司',
        period: '2023-至今',
        description: '带领5人技术团队，负责产品技术架构和团队管理',
        position: new THREE.Vector3(4, 2, 0),
        color: '#667eea',
        type: 'work'
      }
    ];

    // Initialize skills
    this.skills3D = [
      { id: '1', name: 'Angular', level: 95, category: 'Frontend', position: new THREE.Vector3(-3, 2, -2), color: '#dd0031' },
      { id: '2', name: 'React', level: 90, category: 'Frontend', position: new THREE.Vector3(-1, 2, -2), color: '#61dafb' },
      { id: '3', name: 'Vue.js', level: 85, category: 'Frontend', position: new THREE.Vector3(1, 2, -2), color: '#4fc08d' },
      { id: '4', name: 'TypeScript', level: 92, category: 'Language', position: new THREE.Vector3(3, 2, -2), color: '#3178c6' },
      { id: '5', name: 'Node.js', level: 88, category: 'Backend', position: new THREE.Vector3(-3, 0, -2), color: '#339933' },
      { id: '6', name: 'Three.js', level: 80, category: 'Graphics', position: new THREE.Vector3(-1, 0, -2), color: '#000000' },
      { id: '7', name: 'GSAP', level: 85, category: 'Animation', position: new THREE.Vector3(1, 0, -2), color: '#88ce02' },
      { id: '8', name: 'Tailwind CSS', level: 90, category: 'Styling', position: new THREE.Vector3(3, 0, -2), color: '#06b6d4' }
    ];

    // Initialize projects
    this.projects3D = [
      {
        id: '1',
        title: '3D作品集网站',
        description: '使用Three.js和Angular构建的现代化3D作品集',
        technologies: ['Angular', 'Three.js', 'GSAP', 'Tailwind CSS'],
        image: 'project1.jpg',
        position: new THREE.Vector3(-2, 1, 2)
      },
      {
        id: '2',
        title: 'AI设计助手',
        description: '集成AI功能的设计工具，提供智能设计建议',
        technologies: ['React', 'AI API', 'Canvas API', 'WebGL'],
        image: 'project2.jpg',
        position: new THREE.Vector3(0, 1, 2)
      },
      {
        id: '3',
        title: '实时数据仪表板',
        description: '企业级数据可视化平台，支持实时数据展示',
        technologies: ['Vue.js', 'D3.js', 'WebSocket', 'Chart.js'],
        image: 'project3.jpg',
        position: new THREE.Vector3(2, 1, 2)
      }
    ];
  }

  private async initThreeJS() {
    try {
      // Import OrbitControls dynamically
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');

      // Initialize Three.js scene
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x0a0a0a);

      // Initialize camera
      const canvas = this.canvasRef.nativeElement;
      this.camera = new THREE.PerspectiveCamera(
        75,
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        1000
      );
      this.camera.position.set(0, 5, 10);

      // Initialize renderer
      this.renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
      });
      this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      // Initialize controls
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxDistance = 20;
      this.controls.minDistance = 5;

      // Initialize raycaster and mouse
      this.raycaster = new THREE.Raycaster();
      this.mouse = new THREE.Vector2();

      // Initialize clock
      this.clock = new THREE.Clock();

      // Add lighting
      this.setupLighting();

      // Add initial content
      this.setupTimeline();

      // Add event listeners
      this.setupEventListeners();

      // Start animation loop
      this.animate();

      // Mark as loaded
      this.isLoading.set(false);
      this.cdr.detectChanges();

    } catch (error) {
      console.error('Failed to initialize Three.js:', error);
      this.isLoading.set(false);
      this.cdr.detectChanges();
    }
  }

  private setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    // Point lights for atmosphere
    const pointLight1 = new THREE.PointLight(0x4facfe, 0.8, 20);
    pointLight1.position.set(-5, 5, 5);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x43e97b, 0.8, 20);
    pointLight2.position.set(5, 5, -5);
    this.scene.add(pointLight2);

    // Spotlight for focus
    const spotLight = new THREE.SpotLight(0xffffff, 1, 30, Math.PI / 6, 0.3);
    spotLight.position.set(0, 15, 0);
    spotLight.target.position.set(0, 0, 0);
    spotLight.castShadow = true;
    this.scene.add(spotLight);
    this.scene.add(spotLight.target);
  }

  private setupTimeline() {
    // Clear existing objects
    this.clearScene();

    // Create timeline path
    const pathGeometry = new THREE.BufferGeometry();
    const pathPoints = this.timelineEvents.map(event => event.position);
    pathGeometry.setFromPoints(pathPoints);

    const pathMaterial = new THREE.LineBasicMaterial({
      color: 0x4facfe,
      linewidth: 3,
      transparent: true,
      opacity: 0.8
    });

    const timelinePath = new THREE.Line(pathGeometry, pathMaterial);
    this.scene.add(timelinePath);

    // Create timeline events
    this.timelineEvents.forEach((event, index) => {
      const group = new THREE.Group();
      group.userData = { type: 'timeline', data: event };

      // Create main sphere
      const sphereGeometry = new THREE.SphereGeometry(0.3, 32, 32);
      const sphereMaterial = new THREE.MeshPhongMaterial({
        color: event.color,
        transparent: true,
        opacity: 0.9,
        emissive: event.color,
        emissiveIntensity: 0.2
      });
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.castShadow = true;
      sphere.receiveShadow = true;
      group.add(sphere);

      // Create ring indicator
      const ringGeometry = new THREE.RingGeometry(0.4, 0.5, 32);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: event.color,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = -Math.PI / 2;
      group.add(ring);

      // Create floating text
      this.createFloatingText(event.title, event.position.clone().add(new THREE.Vector3(0, 0.8, 0)), 0.3);

      // Position the group
      group.position.copy(event.position);

      // Add floating animation
      group.userData['originalY'] = event.position.y;
      group.userData['animationOffset'] = index * 0.5;

      this.scene.add(group);
    });
  }

  private setupSkills() {
    // Clear existing objects
    this.clearScene();

    // Create skill categories
    const categories = [...new Set(this.skills3D.map(skill => skill.category))];

    this.skills3D.forEach((skill, index) => {
      const group = new THREE.Group();
      group.userData = { type: 'skill', data: skill };

      // Create skill cube with size based on level
      const size = 0.2 + (skill.level / 100) * 0.8;
      const cubeGeometry = new THREE.BoxGeometry(size, size, size);
      const cubeMaterial = new THREE.MeshPhongMaterial({
        color: skill.color,
        transparent: true,
        opacity: 0.8,
        emissive: skill.color,
        emissiveIntensity: 0.1
      });
      const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
      cube.castShadow = true;
      cube.receiveShadow = true;
      group.add(cube);

      // Create skill level indicator
      const levelHeight = (skill.level / 100) * 2;
      const levelGeometry = new THREE.CylinderGeometry(0.05, 0.05, levelHeight, 8);
      const levelMaterial = new THREE.MeshBasicMaterial({
        color: skill.color,
        transparent: true,
        opacity: 0.7
      });
      const levelIndicator = new THREE.Mesh(levelGeometry, levelMaterial);
      levelIndicator.position.y = levelHeight / 2 + size / 2 + 0.1;
      group.add(levelIndicator);

      // Create floating text
      this.createFloatingText(skill.name, skill.position.clone().add(new THREE.Vector3(0, 1.5, 0)), 0.2);
      this.createFloatingText(`${skill.level}%`, skill.position.clone().add(new THREE.Vector3(0, -0.8, 0)), 0.15);

      // Position the group
      group.position.copy(skill.position);

      // Add rotation animation
      group.userData['rotationSpeed'] = 0.01 + (skill.level / 100) * 0.02;

      this.scene.add(group);
      skill.mesh = cube;
    });
  }

  private setupProjects() {
    // Clear existing objects
    this.clearScene();

    this.projects3D.forEach((project, index) => {
      const group = new THREE.Group();
      group.userData = { type: 'project', data: project };

      // Create project card
      const cardGeometry = new THREE.BoxGeometry(2, 1.5, 0.1);
      const cardMaterial = new THREE.MeshPhongMaterial({
        color: 0x2a2a2a,
        transparent: true,
        opacity: 0.9
      });
      const card = new THREE.Mesh(cardGeometry, cardMaterial);
      card.castShadow = true;
      card.receiveShadow = true;
      group.add(card);

      // Create project frame
      const frameGeometry = new THREE.BoxGeometry(2.1, 1.6, 0.05);
      const frameMaterial = new THREE.MeshPhongMaterial({
        color: 0x4facfe,
        emissive: 0x4facfe,
        emissiveIntensity: 0.2
      });
      const frame = new THREE.Mesh(frameGeometry, frameMaterial);
      frame.position.z = 0.025;
      group.add(frame);

      // Create floating text
      this.createFloatingText(project.title, project.position.clone().add(new THREE.Vector3(0, 1.2, 0)), 0.25);

      // Position the group
      group.position.copy(project.position);

      // Add hover animation
      group.userData['originalScale'] = 1;
      group.userData['hoverScale'] = 1.1;

      this.scene.add(group);
      project.mesh = group;
    });
  }

  private createFloatingText(text: string, position: THREE.Vector3, size: number) {
    // Create text geometry (simplified - in real implementation you'd use TextGeometry)
    const textGeometry = new THREE.PlaneGeometry(text.length * size * 0.6, size);
    const textMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9
    });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.copy(position);
    textMesh.lookAt(this.camera.position);
    this.scene.add(textMesh);
  }

  private clearScene() {
    // Remove all objects except lights
    const objectsToRemove: THREE.Object3D[] = [];
    this.scene.traverse((child) => {
      if (child !== this.scene && !(child instanceof THREE.Light)) {
        objectsToRemove.push(child);
      }
    });
    objectsToRemove.forEach(obj => this.scene.remove(obj));
  }

  private setupEventListeners() {
    // Mouse events
    this.renderer.domElement.addEventListener('click', this.onMouseClick.bind(this));
    this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));

    // Resize event
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  private onMouseClick(event: MouseEvent) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object;
      let parent = intersectedObject.parent;

      while (parent && !parent.userData['type']) {
        parent = parent.parent;
      }

      if (parent && parent.userData['data']) {
        this.selectedItem.set(parent.userData['data']);
        this.cdr.detectChanges();
      }
    }
  }

  private onMouseMove(event: MouseEvent) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  private onWindowResize() {
    const canvas = this.canvasRef.nativeElement;
    this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  }

  private animate() {
    this.animationId = requestAnimationFrame(() => this.animate());

    const elapsedTime = this.clock.getElapsedTime();

    // Update controls
    this.controls.update();

    // Animate objects based on current view
    this.scene.traverse((child) => {
      if (child.userData['type'] === 'timeline') {
        // Floating animation for timeline events
        if (child.userData['originalY'] !== undefined) {
          child.position.y = child.userData['originalY'] + Math.sin(elapsedTime + child.userData['animationOffset']) * 0.2;
        }
      } else if (child.userData['type'] === 'skill') {
        // Rotation animation for skills
        if (child.userData['rotationSpeed']) {
          child.rotation.y += child.userData['rotationSpeed'];
          child.rotation.x += child.userData['rotationSpeed'] * 0.5;
        }
      } else if (child.userData['type'] === 'project') {
        // Gentle rotation for projects
        child.rotation.y = Math.sin(elapsedTime * 0.5) * 0.1;
      }
    });

    // Render the scene
    this.renderer.render(this.scene, this.camera);
  }

  // Public methods for view switching
  switchView(view: 'timeline' | 'skills' | 'projects') {
    this.currentView.set(view);
    this.selectedItem.set(null);

    switch (view) {
      case 'timeline':
        this.setupTimeline();
        break;
      case 'skills':
        this.setupSkills();
        break;
      case 'projects':
        this.setupProjects();
        break;
    }

    this.cdr.detectChanges();
  }
}
