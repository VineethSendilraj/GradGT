# GradGT - Georgia Tech Course Prerequisites Visualization

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An interactive visualization tool for exploring course prerequisites at Georgia Tech's School of Computing. This tool helps students better understand course dependencies and plan their academic journey.

## About

GradGT is a modern, interactive tool designed to help Georgia Tech students visualize and understand course prerequisites in the School of Computing. Built with Next.js and TypeScript, it provides real-time enrollment data and an intuitive interface for exploring course relationships.

## Features

- **Interactive Course Map**: Visual representation of course prerequisites and their relationships
- **Real-time Enrollment Data**: View current and historical enrollment statistics:
  - Current semester enrollment
  - Previous semester enrollment
  - One year ago enrollment
  - Three semesters ago enrollment
- **Dark/Light Mode**: Toggle between dark and light themes for comfortable viewing
- **Zoom & Pan**: Easily navigate through the course map
- **Course Categories**:
  - Required Courses (Amber)
  - Intelligence Courses (Emerald)
  - Information Courses (Orange)
  - Systems Courses (Blue)
  - Theory Courses (Purple)
- **AND/OR Logic**: Diamond shapes represent prerequisite logic gates

## Technical Details

### Course Node Structure
Each course is represented as a node with:
- Course ID (e.g., CS 1331)
- Course Title
- Prerequisites
- Thread Classifications
- Credit Hours
- Historical Enrollment Data

### Thread Requirements
- Each thread requires 18 credit hours
- Minimum of 6 courses per thread
- Core courses may count towards thread requirements
- Some courses can satisfy multiple thread requirements

## Getting Started

1. Visit [GradGT](https://gradgt.vercel.app)
2. Select your threads of interest
3. Explore course prerequisites and relationships
4. Use filters to focus on specific course categories
5. Toggle enrollment data for capacity planning

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on how to get started.

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table align="center">
  <tr>
    <td align="center"><a href="https://github.com/VineethSendilraj"><img src="public/Vineeth Sendilraj.jpeg" width="100px;" alt=""/><br /><sub><b>Vineeth Sendilraj</b></sub></a><br /><a title="Project Lead">🌟</a> <a href="https://github.com/VineethSendilraj/GradGT/commits?author=VineethSendilraj" title="Code">💻</a> <a href="#design" title="Design">🎨</a> <a href="#ideas" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/KioskDetonator"><img src="public/Daveh Day Image.jpeg" width="100px;" alt=""/><br /><sub><b>Daveh Day</b></sub></a><br /><a title="Project Lead">🌟</a> <a href="https://github.com/KioskDetonator/GradGT/commits?author=KioskDetonator" title="Code">💻</a> <a href="#ideas" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/vivek-vishwanath"><img src="public/Vivek Vishwanath Profile.jpeg" width="100px;" alt=""/><br /><sub><b>Vivek Vishwanath</b></sub></a><br /><a title="Project Lead">🌟</a> <a href="https://github.com/vivek-vishwanath/GradGT/commits?author=vivek-vishwanath" title="Code">💻</a> <a href="#ideas" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/mhb6"><img src="https://avatars.githubusercontent.com/u/24942852?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Dr. Mary Hudachek-Buswell</b></sub></a><br /><a href="#content" title="Content">🖋</a> <a href="#design" title="Design">🎨</a> <a href="#ideas" title="Ideas, Planning, & Feedback">🤔</a></td>
  </tr>
</table>
<!-- markdownlint-restore -->
<!-- Done -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- GT Scheduler Team for their comprehensive API
- School of Computing for public course data
- Mary Hudachek-Buswell for project direction and support
