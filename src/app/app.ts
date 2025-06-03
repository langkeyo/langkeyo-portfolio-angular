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
import { MiniGamesComponent } from './components/mini-games/mini-games.component';


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
    MiniGamesComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'modern-portfolio-angular';
}
