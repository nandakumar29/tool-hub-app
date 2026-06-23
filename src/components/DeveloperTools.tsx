import React, { useState, useEffect } from 'react';
import { Braces, Binary, Shield, Fingerprint, Link, Copy, Check, ArrowDownUp, AlertCircle, RefreshCw, FileCode } from 'lucide-react';

// --- HELPERS FOR JSON TO MODEL CONVERTER ---
const toCamel = (str: string): string => {
  return str.replace(/([-_][a-z])/ig, ($1) => {
    return $1.toUpperCase().replace('-', '').replace('_', '');
  });
};

const toPascal = (str: string): string => {
  const camel = toCamel(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
};

const capitalizeField = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

function generateTypeScript(registry: Record<string, any>): string {
  let code = '';
  for (const [className, props] of Object.entries(registry) as [string, any][]) {
    code += `export interface ${className} {\n`;
    for (const [key, prop] of Object.entries(props) as [string, any][]) {
      let typeStr = 'any';
      if (prop.type === 'string') typeStr = 'string';
      else if (prop.type === 'number') typeStr = 'number';
      else if (prop.type === 'boolean') typeStr = 'boolean';
      else if (prop.type === 'object') typeStr = prop.elementClass;
      else if (prop.type === 'array') {
        if (prop.element === 'object') {
          typeStr = `${prop.elementClass}[]`;
        } else if (prop.element === 'null') {
          typeStr = 'any[]';
        } else {
          typeStr = `${prop.elementClass}[]`;
        }
      }
      code += `  ${key}: ${typeStr};\n`;
    }
    code += `}\n\n`;
  }
  return code.trim();
}

function generatePython(registry: Record<string, any>): string {
  let code = 'from dataclasses import dataclass\nfrom typing import List, Optional, Any\n\n';
  for (const [className, props] of Object.entries(registry) as [string, any][]) {
    code += `@dataclass\nclass ${className}:\n`;
    const entries = Object.entries(props) as [string, any][];
    if (entries.length === 0) {
      code += `    pass\n\n`;
      continue;
    }
    for (const [key, prop] of entries) {
      let typeStr = 'Any';
      if (prop.type === 'string') typeStr = 'str';
      else if (prop.type === 'number') {
        typeStr = Number.isInteger(prop.raw) ? 'int' : 'float';
      }
      else if (prop.type === 'boolean') typeStr = 'bool';
      else if (prop.type === 'object') typeStr = prop.elementClass;
      else if (prop.type === 'array') {
        if (prop.element === 'object') {
          typeStr = `List[${prop.elementClass}]`;
        } else if (prop.element === 'null') {
          typeStr = 'List[Any]';
        } else {
          let inner = 'Any';
          if (prop.element === 'string') inner = 'str';
          else if (prop.element === 'number') {
            inner = Number.isInteger(prop.raw[0]) ? 'int' : 'float';
          }
          else if (prop.element === 'boolean') inner = 'bool';
          typeStr = `List[${inner}]`;
        }
      }
      code += `    ${key}: ${typeStr}\n`;
    }
    code += `\n`;
  }
  return code.trim();
}

function generateDart(registry: Record<string, any>): string {
  let code = '';
  for (const [className, props] of Object.entries(registry) as [string, any][]) {
    code += `class ${className} {\n`;
    
    // 1. Fields
    for (const [key, prop] of Object.entries(props) as [string, any][]) {
      let typeStr = 'dynamic';
      if (prop.type === 'string') typeStr = 'String';
      else if (prop.type === 'number') {
        typeStr = Number.isInteger(prop.raw) ? 'int' : 'double';
      }
      else if (prop.type === 'boolean') typeStr = 'bool';
      else if (prop.type === 'object') typeStr = prop.elementClass;
      else if (prop.type === 'array') {
        if (prop.element === 'object') {
          typeStr = `List<${prop.elementClass}>`;
        } else if (prop.element === 'null') {
          typeStr = 'List<dynamic>';
        } else {
          let inner = 'dynamic';
          if (prop.element === 'string') inner = 'String';
          else if (prop.element === 'number') {
            inner = Number.isInteger(prop.raw[0]) ? 'int' : 'double';
          }
          else if (prop.element === 'boolean') inner = 'bool';
          typeStr = `List<${inner}>`;
        }
      }
      code += `  final ${typeStr} ${key};\n`;
    }
    
    code += `\n`;

    // 2. Constructor
    code += `  ${className}({\n`;
    for (const key of Object.keys(props)) {
      code += `    required this.${key},\n`;
    }
    code += `  });\n\n`;

    // 3. FromJson
    code += `  factory ${className}.fromJson(Map<String, dynamic> json) {\n`;
    code += `    return ${className}(\n`;
    for (const [key, prop] of Object.entries(props) as [string, any][]) {
      if (prop.type === 'object') {
        code += `      ${key}: ${prop.elementClass}.fromJson(json['${key}'] ?? {}),\n`;
      } else if (prop.type === 'array' && prop.element === 'object') {
        code += `      ${key}: (json['${key}'] as List? ?? []).map((e) => ${prop.elementClass}.fromJson(e)).toList(),\n`;
      } else if (prop.type === 'array') {
        let castType = 'dynamic';
        if (prop.element === 'string') castType = 'String';
        else if (prop.element === 'number') castType = Number.isInteger(prop.raw[0]) ? 'int' : 'double';
        else if (prop.element === 'boolean') castType = 'bool';
        code += `      ${key}: List<${castType}>.from(json['${key}'] ?? []),\n`;
      } else {
        let fallback = 'null';
        if (prop.type === 'string') fallback = "''";
        else if (prop.type === 'number') fallback = '0';
        else if (prop.type === 'boolean') fallback = 'false';
        code += `      ${key}: json['${key}'] ?? ${fallback},\n`;
      }
    }
    code += `    );\n`;
    code += `  }\n\n`;

    // 4. ToJson
    code += `  Map<String, dynamic> toJson() {\n`;
    code += `    return {\n`;
    for (const [key, prop] of Object.entries(props) as [string, any][]) {
      if (prop.type === 'object') {
        code += `      '${key}': ${key}.toJson(),\n`;
      } else if (prop.type === 'array' && prop.element === 'object') {
        code += `      '${key}': ${key}.map((e) => e.toJson()).toList(),\n`;
      } else {
        code += `      '${key}': ${key},\n`;
      }
    }
    code += `    };\n`;
    code += `  }\n`;

    code += `}\n\n`;
  }
  return code.trim();
}

function generateJava(registry: Record<string, any>): string {
  let code = 'import java.util.List;\n\n';
  for (const [className, props] of Object.entries(registry) as [string, any][]) {
    code += `public class ${className} {\n`;
    
    // Private fields
    for (const [key, prop] of Object.entries(props) as [string, any][]) {
      let typeStr = 'Object';
      if (prop.type === 'string') typeStr = 'String';
      else if (prop.type === 'number') {
        typeStr = Number.isInteger(prop.raw) ? 'Integer' : 'Double';
      }
      else if (prop.type === 'boolean') typeStr = 'Boolean';
      else if (prop.type === 'object') typeStr = prop.elementClass;
      else if (prop.type === 'array') {
        if (prop.element === 'object') {
          typeStr = `List<${prop.elementClass}>`;
        } else if (prop.element === 'null') {
          typeStr = 'List<Object>';
        } else {
          let inner = 'Object';
          if (prop.element === 'string') inner = 'String';
          else if (prop.element === 'number') {
            inner = Number.isInteger(prop.raw[0]) ? 'Integer' : 'Double';
          }
          else if (prop.element === 'boolean') inner = 'Boolean';
          typeStr = `List<${inner}>`;
        }
      }
      code += `    private ${typeStr} ${key};\n`;
    }
    code += `\n`;

    // Default constructor
    code += `    public ${className}() {}\n\n`;

    // All-arg constructor
    const hasProps = Object.keys(props).length > 0;
    if (hasProps) {
      code += `    public ${className}(`;
      const argsList: string[] = [];
      for (const [key, prop] of Object.entries(props) as [string, any][]) {
        let typeStr = 'Object';
        if (prop.type === 'string') typeStr = 'String';
        else if (prop.type === 'number') {
          typeStr = Number.isInteger(prop.raw) ? 'Integer' : 'Double';
        }
        else if (prop.type === 'boolean') typeStr = 'Boolean';
        else if (prop.type === 'object') typeStr = prop.elementClass;
        else if (prop.type === 'array') {
          if (prop.element === 'object') {
            typeStr = `List<${prop.elementClass}>`;
          } else if (prop.element === 'null') {
            typeStr = 'List<Object>';
          } else {
            let inner = 'Object';
            if (prop.element === 'string') inner = 'String';
            else if (prop.element === 'number') {
              inner = Number.isInteger(prop.raw[0]) ? 'Integer' : 'Double';
            }
            else if (prop.element === 'boolean') inner = 'Boolean';
            typeStr = `List<${inner}>`;
          }
        }
        argsList.push(`${typeStr} ${key}`);
      }
      code += argsList.join(', ') + `) {\n`;
      for (const key of Object.keys(props)) {
        code += `        this.${key} = ${key};\n`;
      }
      code += `    }\n\n`;
    }

    // Getters and Setters
    for (const [key, prop] of Object.entries(props) as [string, any][]) {
      let typeStr = 'Object';
      if (prop.type === 'string') typeStr = 'String';
      else if (prop.type === 'number') {
        typeStr = Number.isInteger(prop.raw) ? 'Integer' : 'Double';
      }
      else if (prop.type === 'boolean') typeStr = 'Boolean';
      else if (prop.type === 'object') typeStr = prop.elementClass;
      else if (prop.type === 'array') {
        if (prop.element === 'object') {
          typeStr = `List<${prop.elementClass}>`;
        } else if (prop.element === 'null') {
          typeStr = 'List<Object>';
        } else {
          let inner = 'Object';
          if (prop.element === 'string') inner = 'String';
          else if (prop.element === 'number') {
            inner = Number.isInteger(prop.raw[0]) ? 'Integer' : 'Double';
          }
          else if (prop.element === 'boolean') inner = 'Boolean';
          typeStr = `List<${inner}>`;
        }
      }
      
      const capKey = capitalizeField(key);
      // Getter
      code += `    public ${typeStr} get${capKey}() {\n`;
      code += `        return this.${key};\n`;
      code += `    }\n\n`;
      // Setter
      code += `    public void set${capKey}(${typeStr} ${key}) {\n`;
      code += `        this.${key} = ${key};\n`;
      code += `    }\n\n`;
    }
    
    code += `}\n\n`;
  }
  return code.trim();
}

function generateCSharp(registry: Record<string, any>): string {
  let code = 'using System.Collections.Generic;\nusing System.Text.Json.Serialization;\n\n';
  for (const [className, props] of Object.entries(registry) as [string, any][]) {
    code += `public class ${className}\n{\n`;
    for (const [key, prop] of Object.entries(props) as [string, any][]) {
      let typeStr = 'object';
      if (prop.type === 'string') typeStr = 'string';
      else if (prop.type === 'number') {
        typeStr = Number.isInteger(prop.raw) ? 'int' : 'double';
      }
      else if (prop.type === 'boolean') typeStr = 'bool';
      else if (prop.type === 'object') typeStr = prop.elementClass;
      else if (prop.type === 'array') {
        if (prop.element === 'object') {
          typeStr = `List<${prop.elementClass}>`;
        } else if (prop.element === 'null') {
          typeStr = 'List<object>';
        } else {
          let inner = 'object';
          if (prop.element === 'string') inner = 'string';
          else if (prop.element === 'number') {
            inner = Number.isInteger(prop.raw[0]) ? 'int' : 'double';
          }
          else if (prop.element === 'boolean') inner = 'bool';
          typeStr = `List<${inner}>`;
        }
      }
      
      const pascalKey = toPascal(key);
      code += `    [JsonPropertyName("${key}")]\n`;
      code += `    public ${typeStr} ${pascalKey} { get; set; }\n\n`;
    }
    code += `}\n\n`;
  }
  return code.trim();
}

function generateGo(registry: Record<string, any>): string {
  let code = 'package models\n\n';
  for (const [className, props] of Object.entries(registry) as [string, any][]) {
    code += `type ${className} struct {\n`;
    for (const [key, prop] of Object.entries(props) as [string, any][]) {
      let typeStr = 'interface{}';
      if (prop.type === 'string') typeStr = 'string';
      else if (prop.type === 'number') {
        typeStr = Number.isInteger(prop.raw) ? 'int' : 'float64';
      }
      else if (prop.type === 'boolean') typeStr = 'bool';
      else if (prop.type === 'object') typeStr = prop.elementClass;
      else if (prop.type === 'array') {
        if (prop.element === 'object') {
          typeStr = `[]${prop.elementClass}`;
        } else if (prop.element === 'null') {
          typeStr = '[]interface{}';
        } else {
          let inner = 'interface{}';
          if (prop.element === 'string') inner = 'string';
          else if (prop.element === 'number') {
            inner = Number.isInteger(prop.raw[0]) ? 'int' : 'float64';
          }
          else if (prop.element === 'boolean') inner = 'bool';
          typeStr = `[]${inner}`;
        }
      }
      
      const pascalKey = toPascal(key);
      code += `\t${pascalKey} ${typeStr} \`json:"${key}"\`\n`;
    }
    code += `}\n\n`;
  }
  return code.trim();
}

function generateKotlin(registry: Record<string, any>): string {
  let code = 'import com.google.gson.annotations.SerializedName\n\n';
  for (const [className, props] of Object.entries(registry) as [string, any][]) {
    code += `data class ${className}(\n`;
    const entries = Object.entries(props) as [string, any][];
    for (let i = 0; i < entries.length; i++) {
      const [key, prop] = entries[i];
      let typeStr = 'Any';
      if (prop.type === 'string') typeStr = 'String';
      else if (prop.type === 'number') {
        typeStr = Number.isInteger(prop.raw) ? 'Int' : 'Double';
      }
      else if (prop.type === 'boolean') typeStr = 'Boolean';
      else if (prop.type === 'object') typeStr = prop.elementClass;
      else if (prop.type === 'array') {
        if (prop.element === 'object') {
          typeStr = `List<${prop.elementClass}>`;
        } else if (prop.element === 'null') {
          typeStr = 'List<Any>';
        } else {
          let inner = 'Any';
          if (prop.element === 'string') inner = 'String';
          else if (prop.element === 'number') {
            inner = Number.isInteger(prop.raw[0]) ? 'Int' : 'Double';
          }
          else if (prop.element === 'boolean') inner = 'Boolean';
          typeStr = `List<${inner}>`;
        }
      }
      
      const isLast = i === entries.length - 1;
      code += `    @SerializedName("${key}")\n`;
      code += `    val ${toCamel(key)}: ${typeStr}${isLast ? '' : ','}\n`;
    }
    code += `)\n\n`;
  }
  return code.trim();
}

function generateSwift(registry: Record<string, any>): string {
  let code = 'import Foundation\n\n';
  for (const [className, props] of Object.entries(registry) as [string, any][]) {
    code += `struct ${className}: Codable {\n`;
    const entries = Object.entries(props) as [string, any][];
    for (const [key, prop] of entries) {
      let typeStr = 'AnyCodable';
      if (prop.type === 'string') typeStr = 'String';
      else if (prop.type === 'number') {
        typeStr = Number.isInteger(prop.raw) ? 'Int' : 'Double';
      }
      else if (prop.type === 'boolean') typeStr = 'Bool';
      else if (prop.type === 'object') typeStr = prop.elementClass;
      else if (prop.type === 'array') {
        if (prop.element === 'object') {
          typeStr = `[${prop.elementClass}]`;
        } else if (prop.element === 'null') {
          typeStr = '[AnyCodable]';
        } else {
          let inner = 'AnyCodable';
          if (prop.element === 'string') inner = 'String';
          else if (prop.element === 'number') {
            inner = Number.isInteger(prop.raw[0]) ? 'Int' : 'Double';
          }
          else if (prop.element === 'boolean') inner = 'Bool';
          typeStr = `[${inner}]`;
        }
      }
      code += `    let ${toCamel(key)}: ${typeStr}?\n`;
    }

    if (entries.length > 0) {
      code += `\n    enum CodingKeys: String, CodingKey {\n`;
      for (const [key] of entries) {
        code += `        case ${toCamel(key)} = "${key}"\n`;
      }
      code += `    }\n`;
    }
    code += `}\n\n`;
  }
  return code.trim();
}

function generateRust(registry: Record<string, any>): string {
  let code = 'use serde::{Serialize, Deserialize};\n\n';
  for (const [className, props] of Object.entries(registry) as [string, any][]) {
    code += `#[derive(Debug, Serialize, Deserialize)]\n`;
    code += `pub struct ${className} {\n`;
    for (const [key, prop] of Object.entries(props) as [string, any][]) {
      let typeStr = 'serde_json::Value';
      if (prop.type === 'string') typeStr = 'String';
      else if (prop.type === 'number') {
        typeStr = Number.isInteger(prop.raw) ? 'i64' : 'f64';
      }
      else if (prop.type === 'boolean') typeStr = 'bool';
      else if (prop.type === 'object') typeStr = prop.elementClass;
      else if (prop.type === 'array') {
        if (prop.element === 'object') {
          typeStr = `Vec<${prop.elementClass}>`;
        } else if (prop.element === 'null') {
          typeStr = 'Vec<serde_json::Value>';
        } else {
          let inner = 'serde_json::Value';
          if (prop.element === 'string') inner = 'String';
          else if (prop.element === 'number') {
            inner = Number.isInteger(prop.raw[0]) ? 'i64' : 'f64';
          }
          else if (prop.element === 'boolean') inner = 'bool';
          typeStr = `Vec<${inner}>`;
        }
      }
      
      code += `    #[serde(rename = "${key}")]\n`;
      code += `    pub ${key}: ${typeStr},\n`;
    }
    code += `}\n\n`;
  }
  return code.trim();
}

function generateJavaScript(registry: Record<string, any>): string {
  let code = '';
  for (const [className, props] of Object.entries(registry) as [string, any][]) {
    code += `class ${className} {\n`;
    code += `  constructor(data = {}) {\n`;
    for (const [key, prop] of Object.entries(props) as [string, any][]) {
      const camelKey = toCamel(key);
      if (prop.type === 'object') {
        code += `    this.${camelKey} = data.${key} ? new ${prop.elementClass}(data.${key}) : null;\n`;
      } else if (prop.type === 'array' && prop.element === 'object') {
        code += `    this.${camelKey} = Array.isArray(data.${key}) ? data.${key}.map(item => new ${prop.elementClass}(item)) : [];\n`;
      } else {
        code += `    this.${camelKey} = data.${key} !== undefined ? data.${key} : null;\n`;
      }
    }
    code += `  }\n`;
    code += `}\n\n`;
  }
  return code.trim();
}

function generatePHP(registry: Record<string, any>): string {
  let code = '<?php\n\n';
  for (const [className, props] of Object.entries(registry) as [string, any][]) {
    code += `class ${className} implements JsonSerializable {\n`;
    for (const [key] of Object.entries(props) as [string, any][]) {
      code += `    private $${toCamel(key)};\n`;
    }
    
    code += `\n`;
    code += `    public function __construct(array $data = []) {\n`;
    for (const [key, prop] of Object.entries(props) as [string, any][]) {
      const camelKey = toCamel(key);
      if (prop.type === 'object') {
        code += `        $this->${camelKey} = isset($data['${key}']) ? new ${prop.elementClass}($data['${key}']) : null;\n`;
      } else if (prop.type === 'array' && prop.element === 'object') {
        code += `        $this->${camelKey} = array_map(function($item) { return new ${prop.elementClass}($item); }, $data['${key}'] ?? []);\n`;
      } else {
        code += `        $this->${camelKey} = $data['${key}'] ?? null;\n`;
      }
    }
    code += `    }\n\n`;

    for (const [key] of Object.entries(props) as [string, any][]) {
      const camelKey = toCamel(key);
      const capKey = capitalizeField(camelKey);
      code += `    public function get${capKey}() {\n`;
      code += `        return $this->${camelKey};\n`;
      code += `    }\n\n`;
    }

    code += `    public function jsonSerialize(): mixed {\n`;
    code += `        return [\n`;
    for (const [key] of Object.entries(props) as [string, any][]) {
      const camelKey = toCamel(key);
      code += `            '${key}' => $this->${camelKey},\n`;
    }
    code += `        ];\n`;
    code += `    }\n`;
    
    code += `}\n\n`;
  }
  return code.trim();
}

interface DeveloperToolsProps {
  toolId: string;
}

export default function DeveloperTools({ toolId }: DeveloperToolsProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const triggerCopy = (txt: string, key: string) => {
    navigator.clipboard.writeText(txt);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  // --- 1. JSON FORMATTER STATE & LOGIC ---
  const [jsonInput, setJsonInput] = useState('{\n  "name": "ToolHub",\n  "tagline": "all in one click",\n  "type": "Web utility Hub",\n  "features": [\n    "Finance Calculators",\n    "Developer Tools"\n  ],\n  "active": true,\n  "year": 2026\n}');
  const [jsonOutput, setJsonOutput] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  const formatJSON = (spaces = 2) => {
    setJsonError(null);
    try {
      if (!jsonInput.trim()) {
        setJsonOutput('');
        return;
      }
      const parsed = JSON.parse(jsonInput);
      setJsonOutput(JSON.stringify(parsed, null, spaces));
    } catch (err: any) {
      setJsonError(err.message || 'Invalid JSON syntax');
    }
  };

  const minifyJSON = () => {
    setJsonError(null);
    try {
      if (!jsonInput.trim()) {
        setJsonOutput('');
        return;
      }
      const parsed = JSON.parse(jsonInput);
      setJsonOutput(JSON.stringify(parsed));
    } catch (err: any) {
      setJsonError(err.message || 'Invalid JSON syntax');
    }
  };

  // Auto-format once on mount for JSON
  useEffect(() => {
    if (toolId === 'json-formatter') {
      formatJSON(2);
    }
  }, [toolId]);


  // --- 2. BASE64 ENCODER DECODER STATE & LOGIC ---
  const [b64Input, setB64Input] = useState('ToolHub - all in one click represents the premium SEO-optimized tools network!');
  const [b64Output, setB64Output] = useState('');
  const [b64Mode, setB64Mode] = useState<'encode' | 'decode'>('encode');
  const [b64Error, setB64Error] = useState<string | null>(null);

  const processBase64 = () => {
    setB64Error(null);
    try {
      if (!b64Input.trim()) {
        setB64Output('');
        return;
      }
      if (b64Mode === 'encode') {
        const encoded = btoa(unescape(encodeURIComponent(b64Input)));
        setB64Output(encoded);
      } else {
        const decoded = decodeURIComponent(escape(atob(b64Input)));
        setB64Output(decoded);
      }
    } catch (err: any) {
      setB64Output('');
      setB64Error('Invalid Base64 string supplied for decoding.');
    }
  };

  useEffect(() => {
    processBase64();
  }, [b64Input, b64Mode]);

  const swapBase64 = () => {
    setB64Mode(b64Mode === 'encode' ? 'decode' : 'encode');
    setB64Input(b64Output || b64Input);
  };


  // --- 3. JWT DECODER STATE & LOGIC ---
  const [jwtInput, setJwtInput] = useState(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlJhamVzaCBLdW1hciIsImVtYWlsIjoicmFqZXNoQHRvb2xodWIuY28uaW4iLCJhZG1pbiI6dHJ1ZSwiaWF0IjoxNzg0NjMwNDAwLCJleHAiOjE3ODczOTUyMDB9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
  );
  const [jwtHeader, setJwtHeader] = useState('');
  const [jwtPayload, setJwtPayload] = useState('');
  const [jwtSignature, setJwtSignature] = useState('');
  const [jwtMeta, setJwtMeta] = useState<{ alg?: string; exp?: string; iat?: string; sub?: string } | null>(null);
  const [jwtError, setJwtError] = useState<string | null>(null);

  const decodeJWT = () => {
    setJwtError(null);
    if (!jwtInput.trim()) {
      setJwtHeader('');
      setJwtPayload('');
      setJwtSignature('');
      setJwtMeta(null);
      return;
    }

    const segments = jwtInput.split('.');
    if (segments.length !== 3) {
      setJwtError('Invalid JWT format. A valid token must have 3 sections separated by a dot (.)');
      return;
    }

    try {
      // Base64Url decode helper
      const b64UrlDecode = (str: string) => {
        let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
          base64 += '=';
        }
        return decodeURIComponent(escape(atob(base64)));
      };

      const headerJSON = b64UrlDecode(segments[0]);
      const payloadJSON = b64UrlDecode(segments[1]);
      
      const headerParsed = JSON.parse(headerJSON);
      const payloadParsed = JSON.parse(payloadJSON);

      setJwtHeader(JSON.stringify(headerParsed, null, 2));
      setJwtPayload(JSON.stringify(payloadParsed, null, 2));
      setJwtSignature(segments[2] || '');

      const meta: typeof jwtMeta = {
        alg: headerParsed.alg,
        sub: payloadParsed.sub || payloadParsed.uid,
      };

      if (payloadParsed.exp) {
        meta.exp = new Date(payloadParsed.exp * 1000).toLocaleString('en-IN');
      }
      if (payloadParsed.iat) {
        meta.iat = new Date(payloadParsed.iat * 1000).toLocaleString('en-IN');
      }

      setJwtMeta(meta);
    } catch (err) {
      setJwtError('Failed parsing JSON Web Token. Check integrity parameters.');
    }
  };

  useEffect(() => {
    decodeJWT();
  }, [jwtInput]);


  // --- 4. SHA256 HASH GENERATOR ---
  const [shaInput, setShaInput] = useState('ToolHub - all in one click - 100% Free SEO Oriented Tools suite');
  const [shaOutput, setShaOutput] = useState('');
  const [shaLoading, setShaLoading] = useState(false);

  const computeSHA256 = async (inputStr: string) => {
    if (!inputStr) {
      setShaOutput('');
      return;
    }
    setShaLoading(true);
    try {
      // Use standard web crypto SubtleDigest
      const encoder = new TextEncoder();
      const rawData = encoder.encode(inputStr);
      const hashBuffer = await crypto.subtle.digest('SHA-256', rawData);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setShaOutput(hashHex);
    } catch (err) {
      // Simple fallback algorithm for offline environments (Fowler-Noll-Vo or standard JS hash if crypt fails)
      let hash = 0;
      for (let i = 0; i < inputStr.length; i++) {
        const char = inputStr.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
      }
      setShaOutput(`fallback_hash_checksum_${Math.abs(hash).toString(16)}`);
    } finally {
      setShaLoading(false);
    }
  };

  useEffect(() => {
    computeSHA256(shaInput);
  }, [shaInput]);


  // --- 5. URL ENCODER DECODER ---
  const [urlInput, setUrlInput] = useState('https://tool-hub-app.vercel.app/search?q=GST calculator & EMI scheduling');
  const [urlOutput, setUrlOutput] = useState('');
  const [urlMode, setUrlMode] = useState<'encode' | 'decode'>('encode');

  const processURL = () => {
    try {
      if (!urlInput.trim()) {
        setUrlOutput('');
        return;
      }
      if (urlMode === 'encode') {
        setUrlOutput(encodeURIComponent(urlInput));
      } else {
        setUrlOutput(decodeURIComponent(urlInput));
      }
    } catch (err) {
      setUrlOutput('Error parsing URL string. Verify character percent escape sequences.');
    }
  };

  useEffect(() => {
    processURL();
  }, [urlInput, urlMode]);

  const swapURL = () => {
    setUrlMode(urlMode === 'encode' ? 'decode' : 'encode');
    setUrlInput(urlOutput || urlInput);
  };


  // --- 6. JSON TO MODEL CONVERTER STATE & LOGIC ---
  const [convJsonInput, setConvJsonInput] = useState('{\n  "id": 1,\n  "name": "Leanne Graham",\n  "username": "Bret",\n  "email": "Sincere@april.biz",\n  "address": {\n    "street": "Kulas Light",\n    "suite": "Apt. 556",\n    "city": "Gwenborough",\n    "zipcode": "92998-3874",\n    "geo": {\n      "lat": "-37.3159",\n      "lng": "81.1496"\n    }\n  },\n  "phone": "1-770-736-8031 x56442",\n  "website": "hildegard.org",\n  "company": {\n    "name": "Romaguera-Crona",\n    "catchPhrase": "Multi-layered client-server neural-net",\n    "bs": "harness real-time e-markets"\n  }\n}');
  const [convTargetLang, setConvTargetLang] = useState<'typescript' | 'javascript' | 'python' | 'dart' | 'kotlin' | 'swift' | 'java' | 'csharp' | 'go' | 'rust' | 'php'>('typescript');
  const [convClassName, setConvClassName] = useState('User');
  const [convOutput, setConvOutput] = useState('');
  const [convError, setConvError] = useState<string | null>(null);

  const handleModelConversion = () => {
    setConvError(null);
    try {
      if (!convJsonInput.trim()) {
        setConvOutput('');
        return;
      }
      
      let parsed = JSON.parse(convJsonInput);
      if (Array.isArray(parsed)) {
        if (parsed.length > 0) {
          parsed = parsed[0];
        } else {
          parsed = {};
        }
      }

      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Input must be a valid JSON Object or Array of Objects.');
      }

      const registry: Record<string, any> = {};

      const analyzeObject = (obj: any, classNameStr: string) => {
        if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return;
        const properties: Record<string, any> = {};
        
        for (const key of Object.keys(obj)) {
          const value = obj[key];
          const pascalKey = toPascal(key);
          
          if (value === null) {
            properties[key] = { type: 'null', raw: null };
          } else if (Array.isArray(value)) {
            if (value.length > 0) {
              const first = value[0];
              if (typeof first === 'object' && first !== null) {
                const subClassName = classNameStr + pascalKey + 'Item';
                analyzeObject(first, subClassName);
                properties[key] = { type: 'array', raw: value, element: 'object', elementClass: subClassName };
              } else {
                properties[key] = { type: 'array', raw: value, element: typeof first, elementClass: typeof first };
              }
            } else {
              properties[key] = { type: 'array', raw: value, element: 'null', elementClass: 'null' };
            }
          } else if (typeof value === 'object') {
            const subClassName = classNameStr + pascalKey;
            analyzeObject(value, subClassName);
            properties[key] = { type: 'object', raw: value, elementClass: subClassName };
          } else {
            properties[key] = { type: typeof value, raw: value };
          }
        }
        registry[classNameStr] = properties;
      };

      const rootClass = toPascal(convClassName) || 'Root';
      analyzeObject(parsed, rootClass);

      let generatedCode = '';
      if (convTargetLang === 'typescript') {
        generatedCode = generateTypeScript(registry);
      } else if (convTargetLang === 'javascript') {
        generatedCode = generateJavaScript(registry);
      } else if (convTargetLang === 'python') {
        generatedCode = generatePython(registry);
      } else if (convTargetLang === 'dart') {
        generatedCode = generateDart(registry);
      } else if (convTargetLang === 'kotlin') {
        generatedCode = generateKotlin(registry);
      } else if (convTargetLang === 'swift') {
        generatedCode = generateSwift(registry);
      } else if (convTargetLang === 'java') {
        generatedCode = generateJava(registry);
      } else if (convTargetLang === 'csharp') {
        generatedCode = generateCSharp(registry);
      } else if (convTargetLang === 'go') {
        generatedCode = generateGo(registry);
      } else if (convTargetLang === 'rust') {
        generatedCode = generateRust(registry);
      } else if (convTargetLang === 'php') {
        generatedCode = generatePHP(registry);
      }

      setConvOutput(generatedCode);
    } catch (err: any) {
      setConvError(err.message || 'Invalid JSON syntax. Please verify.');
      setConvOutput('');
    }
  };

  useEffect(() => {
    handleModelConversion();
  }, [convJsonInput, convTargetLang, convClassName]);


  return (
    <div className="w-full">
      {/* 1. JSON FORMATTER UI */}
      {toolId === 'json-formatter' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="json-formatter-block">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-3">
                <Braces className="w-5 h-5 text-indigo-600" />
                Raw Input JSON
              </h3>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="Paste your unformatted or messy JSON string..."
                className="w-full h-80 px-3.5 py-3 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 whitespace-pre"
              />
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={() => formatJSON(2)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition"
              >
                Prettify (2 Spaces)
              </button>
              <button
                onClick={() => formatJSON(4)}
                className="px-4 py-2 bg-zinc-850 hover:bg-zinc-800 dark:bg-zinc-800 hover:dark:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-lg transition"
              >
                Prettify (4 Spaces)
              </button>
              <button
                onClick={minifyJSON}
                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 text-xs font-bold rounded-lg transition"
              >
                Minify JSON
              </button>
              <button
                onClick={() => { setJsonInput(''); setJsonOutput(''); setJsonError(null); }}
                className="px-4 py-2 text-zinc-500 hover:text-zinc-700 text-xs font-semibold transition ml-auto"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col justify-between">
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Processed JSON</h3>
                {jsonOutput && (
                  <button
                    onClick={() => triggerCopy(jsonOutput, 'json_output')}
                    className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg flex items-center gap-1.2 text-xs text-zinc-650"
                  >
                    {copied === 'json_output' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    {copied === 'json_output' ? 'Copied' : 'Copy'}
                  </button>
                )}
              </div>

              {jsonError && (
                <div className="mb-3 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-450">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold">JSON Parsing Error</p>
                    <p className="font-mono mt-1">{jsonError}</p>
                  </div>
                </div>
              )}

              <textarea
                readOnly
                value={jsonOutput}
                placeholder="Your formatted output will represent here..."
                className="w-full h-80 px-3.5 py-3 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono bg-zinc-100/50 dark:bg-zinc-950/70 focus:outline-none focus:ring-0 text-zinc-850 dark:text-zinc-200 whitespace-pre"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. BASE64 ENCODER DECODER */}
      {toolId === 'base64-encode-decode' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="b64-block">
          <div className="lg:col-span-12 flex items-center gap-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-950 p-4 rounded-2xl mb-2">
            <span className="text-xs font-bold text-indigo-700 bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 px-3 py-1.5 rounded-lg uppercase">
              Current Mode
            </span>
            <span className="text-sm font-semibold capitalize text-zinc-700 dark:text-zinc-300">
              {b64Mode === 'encode' ? 'Normal Plain Text ➔ Base64 String' : 'Base64 String ➔ Decoding Plain Text'}
            </span>
            <button
              onClick={swapBase64}
              className="ml-auto bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center gap-2 text-xs font-bold shadow-xs transition"
            >
              <ArrowDownUp className="w-4 h-4 text-indigo-600" />
              Swap Mode
            </button>
          </div>

          <div className="lg:col-span-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
            <h3 className="text-md font-bold text-zinc-900 dark:text-white mb-2">Source Input</h3>
            <textarea
              value={b64Input}
              onChange={(e) => setB64Input(e.target.value)}
              placeholder={b64Mode === 'encode' ? 'Enter plain text data to encode...' : 'Paste Base64 coded text to decode...'}
              className="w-full h-56 px-3.5 py-3 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
            <div className="flex mt-2 justify-end">
              <button onClick={() => setB64Input('')} className="text-xs text-zinc-400 hover:text-zinc-650 font-semibold">
                Clear Input
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-md font-bold text-zinc-900 dark:text-white">Generated Translation</h3>
                {b64Output && (
                  <button
                    onClick={() => triggerCopy(b64Output, 'b64')}
                    className="p-1 hover:bg-zinc-250 dark:hover:bg-zinc-800 rounded flex items-center gap-1 text-xs text-zinc-500 font-medium"
                  >
                    {copied === 'b64' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied === 'b64' ? 'Copied' : 'Copy Result'}
                  </button>
                )}
              </div>

              {b64Error && (
                <div className="mb-3 p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-700 text-xs font-mono">
                  {b64Error}
                </div>
              )}

              <textarea
                readOnly
                value={b64Output}
                placeholder="Output parsed Base64 will render here..."
                className="w-full h-56 px-3.5 py-3 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm bg-zinc-100/50 dark:bg-zinc-950/70 focus:outline-none text-zinc-850 dark:text-zinc-200 font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. JWT DECODER */}
      {toolId === 'jwt-decoder' && (
        <div className="space-y-6" id="jwt-block">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-indigo-600" />
              Raw encoded JSON Web Token (JWT)
            </h3>
            <textarea
              value={jwtInput}
              onChange={(e) => setJwtInput(e.target.value)}
              placeholder="Paste your eyJ... token string here..."
              className="w-full h-24 px-3.5 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 select-all"
            />
            {jwtError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-mono mt-3">
                {jwtError}
              </div>
            )}
          </div>

          {jwtMeta && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-indigo-50/20 dark:bg-zinc-900 border border-indigo-100 dark:border-zinc-800 p-4 rounded-xl">
              <div className="text-center">
                <span className="block text-xs text-zinc-400 font-semibold mb-1">Algorithm</span>
                <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300 font-mono">{jwtMeta.alg || 'Unknown'}</span>
              </div>
              <div className="text-center border-l border-zinc-200 dark:border-zinc-800">
                <span className="block text-xs text-zinc-400 font-semibold mb-1">Issued At (iat)</span>
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{jwtMeta.iat || 'N/A'}</span>
              </div>
              <div className="text-center border-l border-zinc-200 dark:border-zinc-800">
                <span className="block text-xs text-zinc-400 font-semibold mb-1">Expires At (exp)</span>
                <span className="text-xs font-semibold text-rose-600 font-mono">{jwtMeta.exp || 'N/A'}</span>
              </div>
              <div className="text-center border-l border-zinc-200 dark:border-zinc-800 col-span-2 md:col-span-1">
                <span className="block text-xs text-zinc-400 font-semibold mb-1">Subject (sub / uid)</span>
                <span className="text-xs font-bold text-zinc-800 truncate dark:text-zinc-300 block px-2 font-mono">{jwtMeta.sub || 'N/A'}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
              <h4 className="text-xs uppercase text-zinc-400 font-bold tracking-wider mb-2">Decoded JSON Header (Alg & Token Type)</h4>
              <pre className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-xl text-xs text-rose-700 dark:text-rose-400 font-mono h-48 overflow-y-auto whitespace-pre-wrap">{jwtHeader || 'Header claims empty.'}</pre>
            </div>
            
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
              <h4 className="text-xs uppercase text-zinc-400 font-bold tracking-wider mb-2">Decoded JSON Payload (Claims & Metadata)</h4>
              <pre className="p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-xl text-xs text-indigo-700 dark:text-indigo-400 font-mono h-48 overflow-y-auto whitespace-pre-wrap">{jwtPayload || 'Payload claims empty.'}</pre>
            </div>
          </div>
        </div>
      )}

      {/* 4. SHA256 HASH GENERATOR */}
      {toolId === 'sha256-generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="sha-block">
          <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-3">
              <Fingerprint className="w-5 h-5 text-indigo-600" />
              Source String Payload
            </h3>
            <textarea
              value={shaInput}
              onChange={(e) => setShaInput(e.target.value)}
              placeholder="Type or paste the file contents or text payload to secure..."
              className="w-full h-48 px-3.5 py-3 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>

          <div className="lg:col-span-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <h3 className="text-sm uppercase text-zinc-400 font-bold tracking-wider mb-3">SHA-256 256-Bit digest hash</h3>
              
              <div className="relative">
                <textarea
                  readOnly
                  value={shaOutput}
                  className="w-full h-24 p-3 pr-10 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono bg-zinc-100/50 dark:bg-zinc-950/70 text-zinc-700 dark:text-zinc-300 resize-none break-all"
                />
                
                {shaOutput && (
                  <button
                    onClick={() => triggerCopy(shaOutput, 'sha')}
                    className="absolute right-2.5 top-2.5 p-1.5 bg-white dark:bg-zinc-800 hover:bg-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-lg"
                  >
                    {copied === 'sha' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4 text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-850 p-3 rounded-lg flex items-center gap-1.5">
              <RefreshCw className={`w-3.5 h-3.5 ${shaLoading ? 'animate-spin' : ''}`} />
              Processed secure SHA256 checksum locally via dynamic browser Web Cryptography layers.
            </div>
          </div>
        </div>
      )}

      {/* 5. URL ENCODER DECODER */}
      {toolId === 'url-encode-decode' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="url-block">
          <div className="lg:col-span-12 flex items-center gap-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-950 p-4 rounded-2xl mb-2">
            <span className="text-xs font-bold text-indigo-700 bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 px-3 py-1.5 rounded-lg uppercase">
              Current Mode
            </span>
            <span className="text-sm font-semibold capitalize text-zinc-700 dark:text-zinc-300">
              {urlMode === 'encode' ? 'Parameter Query Text ➔ Coded Hex URL Percentiles' : 'Coded Links ➔ Decoded Readable Strings'}
            </span>
            <button
              onClick={swapURL}
              className="ml-auto bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200 p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center gap-2 text-xs font-bold transition shadow-xs"
            >
              <ArrowDownUp className="w-4 h-4 text-indigo-600" />
              Swap Mode
            </button>
          </div>

          <div className="lg:col-span-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
            <h3 className="text-md font-bold text-zinc-900 dark:text-white mb-2">Input URL String</h3>
            <textarea
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Enter parameters or Web Link strings here..."
              className="w-full h-56 px-3.5 py-3 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>

          <div className="lg:col-span-6 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-md font-bold text-zinc-900 dark:text-white">Generated Translation</h3>
                {urlOutput && (
                  <button
                    onClick={() => triggerCopy(urlOutput, 'url')}
                    className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded flex items-center gap-1 text-xs text-zinc-500 font-medium"
                  >
                    {copied === 'url' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied === 'url' ? 'Copied' : 'Copy Result'}
                  </button>
                )}
              </div>

              <textarea
                readOnly
                value={urlOutput}
                placeholder="Parsed URL outputs will populate here..."
                className="w-full h-56 px-3.5 py-3 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm bg-zinc-100/50 dark:bg-zinc-950/70 focus:outline-none text-zinc-850 dark:text-zinc-200 font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* 6. JSON TO MODEL CONVERTER UI */}
      {toolId === 'json-to-model' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="json-model-block">
          <div className="lg:col-span-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-md font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <FileCode className="w-5 h-5 text-indigo-600" />
              Configure Target Output Model Settings
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                  Target Language / Framework Options
                </label>
                <div className="flex flex-wrap gap-2">
                  {([
                    'typescript', 'javascript', 'python', 'dart', 'kotlin', 'swift', 'java', 'csharp', 'go', 'rust', 'php'
                  ] as const).map((lang) => {
                    const labelMap: Record<string, string> = {
                      typescript: 'TS Interface',
                      javascript: 'JS ES6',
                      python: 'Python',
                      dart: 'Dart / Flutter',
                      kotlin: 'Kotlin / Android',
                      swift: 'Swift / iOS',
                      java: 'Java',
                      csharp: 'C#',
                      go: 'Go',
                      rust: 'Rust',
                      php: 'PHP'
                    };
                    return (
                      <button
                        key={lang}
                        onClick={() => setConvTargetLang(lang)}
                        className={`px-3 py-2 text-xs font-bold rounded-lg border transition cursor-pointer ${
                          convTargetLang === lang
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                            : 'bg-zinc-50 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        {labelMap[lang] || lang}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                  Root Object Class Name
                </label>
                <input
                  type="text"
                  value={convClassName}
                  onChange={(e) => setConvClassName(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                  placeholder="e.g. User, ApiResponse, Product"
                  className="w-full px-3.5 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-md font-bold text-zinc-900 dark:text-white mb-3">
                Source Input JSON Payload
              </h3>
              <textarea
                value={convJsonInput}
                onChange={(e) => setConvJsonInput(e.target.value)}
                placeholder="Paste or enter raw JSON string layout here..."
                className="w-full h-96 px-3.5 py-3 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono whitespace-pre leading-relaxed"
              />
            </div>
            
            <div className="flex mt-3 justify-between items-center">
              <button
                onClick={() => setConvJsonInput('{\n  "demo_key": "Paste your custom nested API responses to convert live"\n}')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
              >
                Load Default Sample
              </button>
              <button
                onClick={() => setConvJsonInput('')}
                className="text-xs text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-350 font-semibold"
              >
                Clear Input
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-md font-bold text-zinc-900 dark:text-white">
                  Generated strongly-typed models
                </h3>
                {convOutput && (
                  <button
                    onClick={() => triggerCopy(convOutput, 'model_conv')}
                    className="px-2.5 py-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 font-semibold border border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-900 cursor-pointer shadow-xs transition"
                  >
                    {copied === 'model_conv' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-indigo-650" />}
                    {copied === 'model_conv' ? 'Copied Model' : 'Copy Classes'}
                  </button>
                )}
              </div>

              {convError && (
                <div className="mb-3 p-3.5 bg-rose-50 border border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/40 text-rose-800 dark:text-rose-400 rounded-xl flex items-start gap-2 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Parsing Error:</span>
                    <p className="font-mono mt-1 text-[11px] leading-relaxed break-all">{convError}</p>
                  </div>
                </div>
              )}

              <textarea
                readOnly
                value={convOutput}
                placeholder="Compiled model files will output here dynamically..."
                className="w-full h-96 px-3.5 py-3 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono bg-zinc-100/50 dark:bg-zinc-950/70 text-zinc-800 dark:text-zinc-200 focus:outline-none whitespace-pre overflow-y-auto leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
