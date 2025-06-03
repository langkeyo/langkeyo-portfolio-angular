import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Hero } from './components/hero/hero';
import { About } from './components/about/about';
import { Projects } from './components/projects/projects';
import { Contact } from './components/contact/contact';
import { MusicPlayerComponent } from './components/music-player/music-player.component';
import { AiEnhancedSkillsComponent } from './components/ai-enhanced-skills/ai-enhanced-skills.component';
import { AiEnhancedProjectsComponent } from './components/ai-enhanced-projects/ai-enhanced-projects.component';
import { AiImageGeneratorComponent } from './components/ai-image-generator/ai-image-generator.component';
import { AiTextGeneratorComponent } from './components/ai-text-generator/ai-text-generator.component';
import { AiCodeGeneratorComponent } from './components/ai-code-generator/ai-code-generator.component';
import { AiDesignAssistantComponent } from './components/ai-design-assistant/ai-design-assistant.component';
import { MiniGamesComponent } from './components/mini-games/mini-games.component';
import { RealTimeDashboardComponent } from './components/real-time-dashboard/real-time-dashboard.component';
import { TechRadarComponent } from './components/tech-radar/tech-radar.component';
import { ThreeDResumeComponent } from './components/three-d-resume/three-d-resume.component';
import { SmartResumeGeneratorComponent } from './components/smart-resume-generator/smart-resume-generator.component';


@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    Header,
    Hero,
    About,
    Projects,
    Contact,
    MusicPlayerComponent,
    AiEnhancedSkillsComponent,
    AiEnhancedProjectsComponent,
    AiImageGeneratorComponent,
    AiTextGeneratorComponent,
    AiCodeGeneratorComponent,
    AiDesignAssistantComponent,
    RealTimeDashboardComponent,
    TechRadarComponent,
    ThreeDResumeComponent,
    SmartResumeGeneratorComponent,
    MiniGamesComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'modern-portfolio-angular';
}
