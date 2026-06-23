// Core helper definitions and interactive templates for Code Compiler & Converter

export interface CodeTemplate {
  name: string;
  category: string;
  description: string;
  snippets: Record<string, string>;
}

export const CODE_TEMPLATES: Record<string, CodeTemplate> = {
  fibonacci: {
    name: 'Fibonacci Sequence',
    category: 'Algorithms',
    description: 'Calculates the Fibonacci number at index N using recursion with performance profiling.',
    snippets: {
      typescript: `// Fibonacci Recursive Algorithm in TypeScript\nfunction fibonacci(n: number): number {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\nconst term = 10;\nconst result = fibonacci(term);\nconsole.log("Fibonacci term at page index " + term + " is: " + result);`,
      javascript: `// Fibonacci Recursive Algorithm in JavaScript\nfunction fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\nconst term = 10;\nconst result = fibonacci(term);\nconsole.log("Fibonacci term at page index " + term + " is: " + result);`,
      python: `# Fibonacci Recursive Algorithm in Python\ndef fibonacci(n: int) -> int:\n    if n <= 1:\n        return n\n    return fibonacci(n - 1) + fibonacci(n - 2)\n\nterm = 10\nresult = fibonacci(term)\nprint("Fibonacci term at page index " + str(term) + " is: " + str(result))`,
      go: `// Fibonacci Recursive Algorithm in Go\npackage main\n\nimport "fmt"\n\nfunc fibonacci(n int) int {\n\tif n <= 1 {\n\t\treturn n\n\t}\n\treturn fibonacci(n-1) + fibonacci(n-2)\n}\n\nfunc main() {\n\tterm := 10\n\tresult := fibonacci(term)\n\tfmt.Printf("Fibonacci term at page index %d is: %d\\n", term, result)\n}`,
      java: `// Fibonacci Recursive Algorithm in Java\npublic class Solution {\n    public static int fibonacci(int n) {\n        if (n <= 1) return n;\n        return fibonacci(n - 1) + fibonacci(n - 2);\n    }\n\n    public static void main(String[] args) {\n        int term = 10;\n        int result = fibonacci(term);\n        System.out.println("Fibonacci term at page index " + term + " is: " + result);\n    }\n}`,
      kotlin: `// Fibonacci Recursive Algorithm in Kotlin\nfun fibonacci(n: Int): Int {\n    if (n <= 1) return n\n    return fibonacci(n - 1) + fibonacci(n - 2)\n}\n\nfun main() {\n    val term = 10\n    val result = fibonacci(term)\n    println("Fibonacci term at page index \$term is: \$result")\n}`,
      swift: `// Fibonacci Recursive Algorithm in Swift\nfunc fibonacci(_ n: Int) -> Int {\n    if n <= 1 { return n }\n    return fibonacci(n - 1) + fibonacci(n - 2)\n}\n\nlet term = 10\nlet result = fibonacci(term)\nprint("Fibonacci term at page index \\(term) is: \\(result)")`,
      dart: `// Fibonacci Recursive Algorithm in Dart / Flutter\nint fibonacci(int n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\nvoid main() {\n  int term = 10;\n  int result = fibonacci(term);\n  print("Fibonacci term at page index \$term is: \$result");\n}`,
      csharp: `// Fibonacci Recursive Algorithm in C#\nusing System;\n\npublic class Program {\n    public static int Fibonacci(int n) {\n        if (n <= 1) return n;\n        return Fibonacci(n - 1) + Fibonacci(n - 2);\n    }\n\n    public static void Main() {\n        int term = 10;\n        int result = Fibonacci(term);\n        Console.WriteLine("Fibonacci term at page index " + term + " is: " + result);\n    }\n}`,
      rust: `// Fibonacci Recursive Algorithm in Rust\nfn fibonacci(n: u32) -> u32 {\n    if n <= 1 {\n        return n;\n    }\n    fibonacci(n - 1) + fibonacci(n - 2)\n}\n\nfn main() {\n    let term = 10;\n    let result = fibonacci(term);\n    println!("Fibonacci term at page index {} is: {}", term, result);\n}`,
      php: `<?php\n// Fibonacci Recursive Algorithm in PHP\nfunction fibonacci(\$n) {\n    if (\$n <= 1) return \$n;\n    return fibonacci(\$n - 1) + fibonacci(\$n - 2);\n}\n\n\$term = 10;\n\$result = fibonacci(\$term);\necho "Fibonacci term at page index " . \$term . " is: " . \$result . "\\n";\n?>`
    }
  },
  binary_search: {
    name: 'Binary Search Algorithm',
    category: 'Algorithms',
    description: 'Conducts efficient searching in O(log N) time on sorted lists recursively.',
    snippets: {
      typescript: `// Binary Search in TypeScript\nfunction binarySearch(arr: number[], target: number): number {\n  let left = 0;\n  let right = arr.length - 1;\n  \n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}\n\nconst sortedArray = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];\nconst searchResult = binarySearch(sortedArray, 23);\nconsole.log("Element found at array index: " + searchResult);`,
      javascript: `// Binary Search in JavaScript\nfunction binarySearch(arr, target) {\n  let left = 0;\n  let right = arr.length - 1;\n  \n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}\n\nconst sortedArray = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];\nconst searchResult = binarySearch(sortedArray, 23);\nconsole.log("Element found at array index: " + searchResult);`,
      python: `# Binary Search in Python\ndef binary_search(arr: list, target: int) -> int:\n    left = 0\n    right = len(arr) - 1\n    \n    while left <= right:\n        mid = (left + right) // 2\n        if arr[mid] == target:\n            return mid\n        if arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1\n\nsorted_array = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]\nsearch_result = binary_search(sorted_array, 23)\nprint("Element found at array index: " + str(search_result))`,
      go: `// Binary Search in Go\npackage main\n\nimport "fmt"\n\nfunc binarySearch(arr []int, target int) int {\n\tleft := 0\n\tright := len(arr) - 1\n\t\n\tfor left <= right {\n\t\tmid := (left + right) / 2\n\t\tif arr[mid] == target {\n\t\t\treturn mid\n\t\t}\n\t\tif arr[mid] < target {\n\t\t\tleft = mid + 1\n\t\t} else {\n\t\t\tright = mid - 1\n\t\t}\n\t}\n\treturn -1\n}\n\nfunc main() {\n\tsortedArray := []int{2, 5, 8, 12, 16, 23, 38, 56, 72, 91}\n\tsearchResult := binarySearch(sortedArray, 23)\n\tfmt.Printf("Element found at array index: %d\\n", searchResult)\n}`,
      java: `// Binary Search in Java\npublic class Solution {\n    public static int binarySearch(int[] arr, int target) {\n        int left = 0;\n        int right = arr.length - 1;\n        \n        while (left <= right) {\n            int mid = left + (right - left) / 2;\n            if (arr[mid] == target) return mid;\n            if (arr[mid] < target) left = mid + 1;\n            else right = mid - 1;\n        }\n        return -1;\n    }\n\n    public static void main(String[] args) {\n        int[] sortedArray = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};\n        int searchResult = binarySearch(sortedArray, 23);\n        System.out.println("Element found at array index: " + searchResult);\n    }\n}`,
      kotlin: `// Binary Search in Kotlin\nfun binarySearch(arr: IntArray, target: Int): Int {\n    var left = 0\n    var right = arr.size - 1\n    \n    while (left <= right) {\n        val mid = (left + right) / 2\n        if (arr[mid] == target) return mid\n        if (arr[mid] < target) left = mid + 1\n        else right = mid - 1\n    }\n    return -1\n}\n\nfun main() {\n    val sortedArray = intArrayOf(2, 5, 8, 12, 16, 23, 38, 56, 72, 91)\n    val searchResult = binarySearch(sortedArray, 23)\n    println("Element found at array index: \$searchResult")\n}`,
      swift: `// Binary Search in Swift\nfunc binarySearch(_ arr: [Int], _ target: Int) -> Int {\n    var left = 0\n    var right = arr.count - 1\n    \n    while left <= right {\n        let mid = (left + right) / 2\n        if arr[mid] == target { return mid }\n        if arr[mid] < target { left = mid + 1 }\n        else { right = mid - 1 }\n    }\n    return -1\n}\n\nlet sortedArray = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]\nlet searchResult = binarySearch(sortedArray, 23)\nprint("Element found at array index: \\(searchResult)")`,
      dart: `// Binary Search in Dart\nint binarySearch(List<int> arr, int target) {\n  int left = 0;\n  int right = arr.length - 1;\n  \n  while (left <= right) {\n    int mid = (left + right) ~/ 2;\n    if (arr[mid] == target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}\n\nvoid main() {\n  List<int> sortedArray = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];\n  int searchResult = binarySearch(sortedArray, 23);\n  print("Element found at array index: \$searchResult");\n}`,
      csharp: `// Binary Search in C#\nusing System;\n\npublic class Program {\n    public static int BinarySearch(int[] arr, int target) {\n        int left = 0;\n        int right = arr.Length - 1;\n        \n        while (left <= right) {\n            int mid = (left + right) / 2;\n            if (arr[mid] == target) return mid;\n            if (arr[mid] < target) left = mid + 1;\n            else right = mid - 1;\n        }\n        return -1;\n    }\n\n    public static void Main() {\n        int[] sortedArray = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};\n        int searchResult = BinarySearch(sortedArray, 23);\n        Console.WriteLine("Element found at array index: " + searchResult);\n    }\n}`,
      rust: `// Binary Search in Rust\nfn binary_search(arr: &[i32], target: i32) -> i32 {\n    let mut left = 0;\n    let mut right = arr.len() as i32 - 1;\n    \n    while left <= right {\n        let mid = (left + right) / 2;\n        if arr[mid as usize] == target {\n            return mid;\n        }\n        if arr[mid as usize] < target {\n            left = mid + 1;\n        } else {\n            right = mid - 1;\n        }\n    }\n    -1\n}\n\nfn main() {\n    let sorted_array = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];\n    let searchResult = binary_search(&sorted_array, 23);\n    println!("Element found at array index: {}", searchResult);\n}`,
      php: `<?php\n// Binary Search in PHP\nfunction binarySearch(\$arr, \$target) {\n    \$left = 0;\n    \$right = count(\$arr) - 1;\n    \n    while (\$left <= \$right) {\n        \$mid = floor((\$left + \$right) / 2);\n        if (\$arr[\$mid] == \$target) return \$mid;\n        if (\$arr[\$mid] < \$target) \$left = \$mid + 1;\n        else \$right = \$mid - 1;\n    }\n    return -1;\n}\n\n\$sortedArray = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];\n\$searchResult = binarySearch(\$sortedArray, 23);\necho "Element found at array index: " . \$searchResult . "\\n";\n?>`
    }
  },
  bubble_sort: {
    name: 'Bubble Sort Algorithm',
    category: 'Algorithms',
    description: 'Performs classic sorting by iterating over consecutive elements.',
    snippets: {
      typescript: `// Bubble Sort in TypeScript\nfunction bubbleSort(arr: number[]): number[] {\n  const n = arr.length;\n  for (let i = 0; i < n - 1; i++) {\n    for (let j = 0; j < n - i - 1; j++) {\n      if (arr[j] > arr[j + 1]) {\n        const temp = arr[j];\n        arr[j] = arr[j + 1];\n        arr[j + 1] = temp;\n      }\n    }\n  }\n  return arr;\n}\n\nconst items = [64, 34, 25, 12, 22, 11, 90];\nconsole.log("Unsorted: " + JSON.stringify(items));\nconst sorted = bubbleSort(items);\nconsole.log("Sorted array: " + JSON.stringify(sorted));`,
      javascript: `// Bubble Sort in JavaScript\nfunction bubbleSort(arr) {\n  const n = arr.length;\n  for (let i = 0; i < n - 1; i++) {\n    for (let j = 0; j < n - i - 1; j++) {\n      if (arr[j] > arr[j + 1]) {\n        const temp = arr[j];\n        arr[j] = arr[j + 1];\n        arr[j + 1] = temp;\n      }\n    }\n  }\n  return arr;\n}\n\nconst items = [64, 34, 25, 12, 22, 11, 90];\nconsole.log("Unsorted: " + JSON.stringify(items));\nconst sorted = bubbleSort(items);\nconsole.log("Sorted array: " + JSON.stringify(sorted));`,
      python: `# Bubble Sort in Python\ndef bubble_sort(arr: list) -> list:\n    n = len(arr)\n    for i in range(n - 1):\n        for j in range(0, n - i - 1):\n            if arr[j] > arr[j + 1]:\n                arr[j], arr[j + 1] = arr[j + 1], arr[j]\n    return arr\n\nitems = [64, 34, 25, 12, 22, 11, 90]\nprint("Unsorted: " + str(items))\nsorted_list = bubble_sort(items)\nprint("Sorted array: " + str(sorted_list))`,
      go: `// Bubble Sort in Go\npackage main\n\nimport "fmt"\n\nfunc bubbleSort(arr []int) []int {\n\tn := len(arr)\n\tfor i := 0; i < n-1; i++ {\n\t\tfor j := 0; j < n-i-1; j++ {\n\t\t\tif arr[j] > arr[j+1] {\n\t\t\t\ttemp := arr[j]\n\t\t\t\tarr[j] = arr[j+1]\n\t\t\t\tarr[j+1] = temp\n\t\t\t}\n\t\t}\n\t}\n\treturn arr\n}\n\nfunc main() {\n\titems := []int{64, 34, 25, 12, 22, 11, 90}\n\tfmt.Printf("Unsorted: %v\\n", items)\n\tsorted := bubbleSort(items)\n\tfmt.Printf("Sorted array: %v\\n", sorted)\n}`,
      java: `// Bubble Sort in Java\nimport java.util.Arrays;\n\npublic class Solution {\n    public static int[] bubbleSort(int[] arr) {\n        int n = arr.length;\n        for (int i = 0; i < n - 1; i++) {\n            for (int j = 0; j < n - i - 1; j++) {\n                if (arr[j] > arr[j + 1]) {\n                    int temp = arr[j];\n                    arr[j] = arr[j + 1];\n                    arr[j + 1] = temp;\n                }\n            }\n        }\n        return arr;\n    }\n\n    public static void main(String[] args) {\n        int[] items = {64, 34, 25, 12, 22, 11, 90};\n        System.out.println("Unsorted: " + Arrays.toString(items));\n        int[] sorted = bubbleSort(items);\n        System.out.println("Sorted array: " + Arrays.toString(sorted));\n    }\n}`,
      kotlin: `// Bubble Sort in Kotlin\nimport java.util.Arrays\n\nfun bubbleSort(arr: IntArray): IntArray {\n    val n = arr.size\n    for (i in 0 until n - 1) {\n        for (j in 0 until n - i - 1) {\n            if (arr[j] > arr[j + 1]) {\n                val temp = arr[j]\n                arr[j] = arr[j + 1]\n                arr[j + 1] = temp\n            }\n        }\n    }\n    return arr\n}\n\nfun main() {\n    val items = intArrayOf(64, 34, 25, 12, 22, 11, 90)\n    println("Unsorted: " + Arrays.toString(items))\n    val sorted = bubbleSort(items)\n    println("Sorted array: " + Arrays.toString(sorted))\n}`,
      swift: `// Bubble Sort in Swift\nfunc bubbleSort(_ arr: [Int]) -> [Int] {\n    var result = arr\n    let n = result.count\n    for i in 0..<n-1 {\n        for j in 0..<n-i-1 {\n            if result[j] > result[j + 1] {\n                let temp = result[j]\n                result[j] = result[j + 1]\n                result[j + 1] = temp\n            }\n        }\n    }\n    return result\n}\n\nlet items = [64, 34, 25, 12, 22, 11, 90]\nprint("Unsorted: \\(items)")\nlet sorted = bubbleSort(items)\nprint("Sorted array: \\(sorted)")`,
      dart: `// Bubble Sort in Dart\nList<int> bubbleSort(List<int> arr) {\n  int n = arr.length;\n  for (int i = 0; i < n - 1; i++) {\n    for (int j = 0; j < n - i - 1; j++) {\n      if (arr[j] > arr[j + 1]) {\n        int temp = arr[j];\n        arr[j] = arr[j + 1];\n        arr[j + 1] = temp;\n      }\n    }\n  }\n  return arr;\n}\n\nvoid main() {\n  List<int> items = [64, 34, 25, 12, 22, 11, 90];\n  print("Unsorted: \$items");\n  List<int> sorted = bubbleSort(items);\n  print("Sorted array: \$sorted");\n}`,
      csharp: `// Bubble Sort in C#\nusing System;\n\npublic class Program {\n    public static int[] BubbleSort(int[] arr) {\n        int n = arr.Length;\n        for (int i = 0; i < n - 1; i++) {\n            for (int j = 0; j < n - i - 1; j++) {\n                if (arr[j] > arr[j + 1]) {\n                    int temp = arr[j];\n                    arr[j] = arr[j + 1];\n                    arr[j + 1] = temp;\n                }\n            }\n        }\n        return arr;\n    }\n\n    public static void Main() {\n        int[] items = {64, 34, 25, 12, 22, 11, 90};\n        Console.WriteLine("Unsorted: " + string.Join(", ", items));\n        int[] sorted = BubbleSort(items);\n        Console.WriteLine("Sorted array: " + string.Join(", ", sorted));\n    }\n}`,
      rust: `// Bubble Sort in Rust\nfn bubble_sort(arr: &mut [i32]) {\n    let n = arr.len();\n    for i in 0..n-1 {\n        for j in 0..n-i-1 {\n            if arr[j] > arr[j + 1] {\n                arr.swap(j, j + 1);\n            }\n        }\n    }\n}\n\nfn main() {\n    let mut items = [64, 34, 25, 12, 22, 11, 90];\n    println!("Unsorted: {:?}", items);\n    bubble_sort(&mut items);\n    println!("Sorted array: {:?}", items);\n}`,
      php: `<?php\n// Bubble Sort in PHP\nfunction bubbleSort(\$arr) {\n    \$n = count(\$arr);\n    for (\$i = 0; \$i < \$n - 1; \$i++) {\n        for (\$j = 0; \$j < \$n - \$i - 1; \$j++) {\n            if (\$arr[\$j] > \$arr[\$j + 1]) {\n                \$temp = \$arr[\$j];\n                \$arr[\$j] = \$arr[\$j + 1];\n                \$arr[\$j + 1] = \$temp;\n            }\n        }\n    }\n    return \$arr;\n}\n\n\$items = [64, 34, 25, 12, 22, 11, 90];\necho "Unsorted: " . json_encode(\$items) . "\\n";\n\$sorted = bubbleSort(\$items);\necho "Sorted array: " . json_encode(\$sorted) . "\\n";\n?>`
    }
  }
};

// Simple intelligent regex-based code translator mapping variables, print statements, functions, loops, etc.
export function translateCode(code: string, fromLang: string, toLang: string): string {
  if (!code || !code.trim()) return '';

  let lines = code.split('\n');
  let translatedLines: string[] = [];

  // Helper patterns for common translations
  for (let line of lines) {
    let trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('#')) {
      // Just translate comments
      if (toLang === 'python' || toLang === 'php') {
        translatedLines.push(line.replace(/^\s*\/\//, '#'));
      } else {
        translatedLines.push(line.replace(/^\s*#/, '//'));
      }
      continue;
    }

    let lineTransformed = line;

    // 1. Logging / Output printing
    // Matches console.log("...", vars)
    if (lineTransformed.includes('console.log') || lineTransformed.includes('print(') || lineTransformed.includes('System.out.println') || lineTransformed.includes('fmt.Println') || lineTransformed.includes('Console.WriteLine') || lineTransformed.includes('println!') || lineTransformed.includes('echo ')) {
      // Extract contents of print statement
      let content = '';
      const match = lineTransformed.match(/(?:console\.log|print|System\.out\.println|fmt\.Println|println!|Console\.WriteLine|echo)\s*\((.*)\)/) || lineTransformed.match(/echo\s+([^;]+)/);
      if (match) {
        content = match[1];
      }

      if (content) {
        // Simple string concat mapper
        if (toLang === 'python') {
          // Replace string concats
          content = content.replace(/\s*\+\s*/g, ' + ');
          lineTransformed = `print(${content})`;
        } else if (toLang === 'typescript' || toLang === 'javascript') {
          lineTransformed = `console.log(${content});`;
        } else if (toLang === 'go') {
          lineTransformed = `fmt.Println(${content})`;
        } else if (toLang === 'java') {
          lineTransformed = `System.out.println(${content});`;
        } else if (toLang === 'kotlin') {
          lineTransformed = `println(${content})`;
        } else if (toLang === 'swift') {
          lineTransformed = `print(${content})`;
        } else if (toLang === 'dart') {
          lineTransformed = `print(${content});`;
        } else if (toLang === 'csharp') {
          lineTransformed = `Console.WriteLine(${content});`;
        } else if (toLang === 'rust') {
          lineTransformed = `println!("{}", ${content});`;
        } else if (toLang === 'php') {
          lineTransformed = `echo ${content} . "\\n";`;
        }
      }
    }

    // 2. Variable declarations (const/let/var -> Target styles)
    if (lineTransformed.match(/(?:const|let|var)\s+(\w+)\s*=\s*(.*)/)) {
      const parts = lineTransformed.match(/(?:const|let|var)\s+(\w+)\s*=\s*(.*)/);
      if (parts) {
        const varName = parts[1];
        const rawVal = parts[2].trim().replace(/;$/, '');

        if (toLang === 'python') {
          let pyVal = rawVal;
          if (rawVal === 'true') pyVal = 'True';
          else if (rawVal === 'false') pyVal = 'False';
          else if (rawVal === 'null') pyVal = 'None';
          lineTransformed = `${getIndent(line)}${varName} = ${pyVal}`;
        } else if (toLang === 'go') {
          lineTransformed = `${getIndent(line)}${varName} := ${rawVal}`;
        } else if (toLang === 'kotlin' || toLang === 'swift') {
          const decl = line.trim().startsWith('const') ? 'val' : 'var';
          lineTransformed = `${getIndent(line)}${decl} ${varName} = ${rawVal}`;
        } else if (toLang === 'rust') {
          const isMut = line.trim().startsWith('let') ? 'mut ' : '';
          lineTransformed = `${getIndent(line)}let ${isMut}${varName} = ${rawVal};`;
        } else if (toLang === 'php') {
          lineTransformed = `${getIndent(line)}\$${varName} = ${rawVal};`;
        } else if (toLang === 'typescript' || toLang === 'javascript' || toLang === 'java' || toLang === 'csharp' || toLang === 'dart') {
          const decl = toLang === 'java' || toLang === 'csharp' || toLang === 'dart' ? 'var' : 'const';
          lineTransformed = `${getIndent(line)}${decl} ${varName} = ${rawVal};`;
        }
      }
    }

    // 3. Function declaration replacements
    if (lineTransformed.match(/function\s+(\w+)\s*\(([^)]*)\)\s*\{?/)) {
      const parts = lineTransformed.match(/function\s+(\w+)\s*\(([^)]*)\)\s*\{?/);
      if (parts) {
        const funcName = parts[1];
        const argsStr = parts[2];
        if (toLang === 'python') {
          lineTransformed = `${getIndent(line)}def ${funcName}(${argsStr}):`;
        } else if (toLang === 'go') {
          lineTransformed = `${getIndent(line)}func ${funcName}(${argsStr}) {`;
        } else if (toLang === 'kotlin') {
          lineTransformed = `${getIndent(line)}fun ${funcName}(${argsStr}) {`;
        } else if (toLang === 'swift') {
          lineTransformed = `${getIndent(line)}func ${funcName}(_ ${argsStr}) {`;
        } else if (toLang === 'rust') {
          lineTransformed = `${getIndent(line)}fn ${funcName}(${argsStr}) {`;
        } else if (toLang === 'php') {
          lineTransformed = `${getIndent(line)}function ${funcName}(${argsStr.split(',').map(arg => '$' + arg.trim()).join(', ')}) {`;
        } else if (toLang === 'java' || toLang === 'csharp') {
          lineTransformed = `${getIndent(line)}public static object ${funcName}(${argsStr}) {`;
        }
      }
    }

    // 4. Return transformations
    if (trimmed.startsWith('return ')) {
      let retVal = trimmed.substring(7);
      if (toLang === 'python') {
        retVal = retVal.replace('true', 'True').replace('false', 'False').replace('null', 'None');
      }
      lineTransformed = `${getIndent(line)}return ${retVal}`;
    }

    // 5. Curly braces adjustments for Python
    if (toLang === 'python') {
      if (trimmed === '}' || trimmed === '};') {
        continue; // Python utilizes indentation, skip standalone closing curly braces
      }
      lineTransformed = lineTransformed.replace(/\s*\{$/, ':');
    }

    translatedLines.push(lineTransformed);
  }

  // Wrap inside structural boilerplate if target language demands it for class contexts (Java/C#/Go)
  let result = translatedLines.join('\n');
  if (toLang === 'java' && !result.includes('class ')) {
    result = `public class Main {\n${result.split('\n').map(l => '    ' + l).join('\n')}\n}`;
  } else if (toLang === 'csharp' && !result.includes('class ')) {
    result = `using System;\n\npublic class Program {\n${result.split('\n').map(l => '    ' + l).join('\n')}\n}`;
  } else if (toLang === 'go' && !result.includes('package ')) {
    result = `package main\n\nimport "fmt"\n\nfunc main() {\n${result.split('\n').map(l => '    ' + l).join('\n')}\n}`;
  }

  return result;
}

function getIndent(line: string): string {
  const match = line.match(/^(\s*)/);
  return match ? match[1] : '';
}

// Client-side TypeScript/JS Execution Sandbox with Safe Console Capturing
export function executeCodeSandbox(code: string): { output: string; duration: number; error: string | null } {
  let logs: string[] = [];
  const oldLog = console.log;
  let errorMsg: string | null = null;
  const start = performance.now();

  try {
    // Override log implementation safely
    console.log = (...args: any[]) => {
      logs.push(args.map(arg => {
        if (typeof arg === 'object' && arg !== null) {
          try { return JSON.stringify(arg); } catch (e) { return String(arg); }
        }
        return String(arg);
      }).join(' '));
    };

    // Compile & Run live in browser
    // Strip TypeScript annotations for raw JS evaluation representation
    let cleanCode = code
      .replace(/:\s*number\b/g, '')
      .replace(/:\s*string\b/g, '')
      .replace(/:\s*boolean\b/g, '')
      .replace(/:\s*any\b/g, '')
      .replace(/:\s*number\[\]/g, '')
      .replace(/:\s*string\[\]/g, '')
      .replace(/:\s*void\b/g, '');

    // Safely run using client-side iframe scope or direct Function execution
    const runFn = new Function(cleanCode);
    runFn();
  } catch (e: any) {
    errorMsg = e.message || String(e);
  } finally {
    console.log = oldLog;
  }

  const duration = Math.round(performance.now() - start);
  return {
    output: logs.length > 0 ? logs.join('\n') : (errorMsg ? '' : '[Finished executing successfully with no outputs]'),
    duration,
    error: errorMsg
  };
}

// Client-side interpreter/compiler simulator for other standard languages (Python, Go, Java, Kotlin)
// Enables real interaction by catching variable configurations or basic loop behaviors
export function simulateCompiler(code: string, lang: string): { output: string; duration: number; error: string | null } {
  const start = performance.now();
  let logs: string[] = [];
  let errorMsg: string | null = null;

  try {
    // Read clean constructs
    const lines = code.split('\n');
    let variables: Record<string, any> = {};
    let isInsideIf = false;
    let shouldSkipIf = false;

    for (let line of lines) {
      const trimmed = line.trim();

      // Skip comments or import packages
      if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('import ') || trimmed.startsWith('using ') || !trimmed) {
        continue;
      }

      // Variable simulations for integers, strings
      // Python style: var_name = 10
      let varMatch = trimmed.match(/^([a-zA-Z_]\w*)\s*=\s*(.*)$/) || trimmed.match(/^(?:val|let|var|const)\s+([a-zA-Z_]\w*)\s*=\s*(.*)$/) || trimmed.match(/^(?:int|double|String|boolean)\s+([a-zA-Z_]\w*)\s*=\s*(.*);$/) || trimmed.match(/^([a-zA-Z_]\w*)\s*:=\s*(.*)$/);
      if (varMatch) {
        const name = varMatch[1];
        let valRaw = varMatch[2].replace(/;$/, '').trim();
        
        // Evaluate simple arithmetic or primitives safely
        try {
          // Check if string literal
          if ((valRaw.startsWith('"') && valRaw.endsWith('"')) || (valRaw.startsWith("'") && valRaw.endsWith("'"))) {
            variables[name] = valRaw.slice(1, -1);
          } else if (valRaw === 'true' || valRaw === 'True') {
            variables[name] = true;
          } else if (valRaw === 'false' || valRaw === 'False') {
            variables[name] = false;
          } else {
            // Check for arithmetic with existing variables
            let arithmeticExpr = valRaw;
            for (const [vName, vVal] of Object.entries(variables)) {
              arithmeticExpr = arithmeticExpr.replace(new RegExp(`\\b${vName}\\b`, 'g'), String(vVal));
            }
            if (/^[0-9+\-*/().\s]+$/.test(arithmeticExpr)) {
              variables[name] = new Function(`return (${arithmeticExpr})`)();
            } else {
              variables[name] = valRaw;
            }
          }
        } catch {
          variables[name] = valRaw;
        }
        continue;
      }

      // Function/Main bypass
      if (trimmed.startsWith('def ') || trimmed.startsWith('func ') || trimmed.startsWith('public class ') || trimmed.startsWith('fun ') || trimmed.startsWith('void main')) {
        continue;
      }

      // If Statement simulation
      let ifMatch = trimmed.match(/^if\s*\(([^)]+)\)\s*\{?/) || trimmed.match(/^if\s+([^:]+):/);
      if (ifMatch) {
        isInsideIf = true;
        let cond = ifMatch[1];
        // replace variables
        for (const [vKey, vVal] of Object.entries(variables)) {
          cond = cond.replace(new RegExp(`\\b${vKey}\\b`, 'g'), typeof vVal === 'string' ? `"${vVal}"` : String(vVal));
        }
        try {
          // check boolean condition
          const pass = new Function(`return (${cond.replace('==', '===').replace('and', '&&').replace('or', '||')})`)();
          shouldSkipIf = !pass;
        } catch {
          shouldSkipIf = false;
        }
        continue;
      }

      if (isInsideIf && (trimmed === '}' || trimmed === '')) {
        isInsideIf = false;
        shouldSkipIf = false;
        continue;
      }

      if (isInsideIf && shouldSkipIf) {
        continue;
      }

      // Print simulations
      // Captures print("...", term) or print(f"...")
      if (trimmed.includes('print') || trimmed.includes('System.out.println') || trimmed.includes('fmt.Printf') || trimmed.includes('fmt.Println') || trimmed.includes('Console.WriteLine') || trimmed.includes('echo ')) {
        // Extract what is inside printing block
        const pMatch = trimmed.match(/(?:print|println|System\.out\.println|fmt\.Println|Console\.WriteLine|echo)\s*\((.*)\)/) || trimmed.match(/echo\s+([^;]+)/) || trimmed.match(/println!\s*\((.*)\)/);
        if (pMatch) {
          let expr = pMatch[1] || pMatch[0];
          expr = expr.replace(/;$/, '').trim();

          // Interpolation or formatting replacements
          let outputTerm = '';
          // Resolve string concatenation with variables
          try {
            let evalExpr = expr;
            // replace variables
            for (const [vKey, vVal] of Object.entries(variables)) {
              evalExpr = evalExpr.replace(new RegExp(`\\b${vKey}\\b`, 'g'), typeof vVal === 'string' ? `"${vVal}"` : String(vVal));
            }
            // replace dots for php
            if (lang === 'php') {
              evalExpr = evalExpr.replace(/\s*\.\s*/g, ' + ');
            }
            outputTerm = String(new Function(`return (${evalExpr})`)());
          } catch {
            // Fallback plain regex stripping if expression contains text structures or complex functions
            let stripped = expr;
            for (const [vKey, vVal] of Object.entries(variables)) {
              stripped = stripped.replace(new RegExp(`\\b${vKey}\\b`, 'g'), String(vVal));
              stripped = stripped.replace(new RegExp(`\\$${vKey}\\b`, 'g'), String(vVal));
              stripped = stripped.replace(new RegExp(`\\bstr\\(${vKey}\\)\\b`), String(vVal));
            }
            // Clean quotes
            outputTerm = stripped.replace(/^["']|["']$/g, '').replace(/["']\s*\+\s*["']/g, '');
          }

          logs.push(outputTerm);
        } else {
          // Print complete fallback if regex doesn't match precisely
          logs.push(trimmed);
        }
      }
    }
  } catch (e: any) {
    errorMsg = `Simulating execution error: ${e.message || String(e)}`;
  }

  const duration = Math.round(performance.now() - start);
  return {
    output: logs.length > 0 ? logs.join('\n') : (errorMsg ? '' : '[Successfully compiled - no logs mapped]'),
    duration,
    error: errorMsg
  };
}
