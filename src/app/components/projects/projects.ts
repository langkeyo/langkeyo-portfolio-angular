import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GitHubStatsComponent } from '../github-stats/github-stats.component';

@Component({
  selector: 'app-projects',
  imports: [CommonModule, GitHubStatsComponent],
  templateUrl: './projects.html',
  styleUrl: './projects.scss'
})
export class Projects {

}
