export const LANGUAGES = [
  {
    id: 63,
    name: 'JavaScript',
    value: 'javascript',
    ext: '.js',
    monacoLang: 'javascript',
    template: '// Welcome to CodeCollab!\nconsole.log("Hello, World!");\n',
  },
  {
    id: 71,
    name: 'Python',
    value: 'python',
    ext: '.py',
    monacoLang: 'python',
    template: '# Welcome to CodeCollab!\nprint("Hello, World!")\n',
  },
  {
    id: 54,
    name: 'C++',
    value: 'cpp',
    ext: '.cpp',
    monacoLang: 'cpp',
    template: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}\n',
  },
  {
    id: 62,
    name: 'Java',
    value: 'java',
    ext: '.java',
    monacoLang: 'java',
    template: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}\n',
  },
];

export function getLanguageByExt(filename) {
  const ext = '.' + filename.split('.').pop();
  return LANGUAGES.find((l) => l.ext === ext) || LANGUAGES[0];
}

export function getLanguageByValue(value) {
  return LANGUAGES.find((l) => l.value === value) || LANGUAGES[0];
}

export const FILE_ICONS = {
  '.js': '📄',
  '.py': '🐍',
  '.cpp': '⚙️',
  '.java': '☕',
  '.txt': '📝',
  default: '📄',
};

export function getFileIcon(filename) {
  const ext = '.' + filename.split('.').pop();
  return FILE_ICONS[ext] || FILE_ICONS.default;
}

export const API_BASE = '/api';
