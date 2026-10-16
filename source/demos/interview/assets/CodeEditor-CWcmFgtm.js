const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/vendor-editor-Dk98lJ2I.js","assets/vendor-react-C-h8dcES.js"])))=>i.map(i=>d[i]);
import{_ as I}from"./index-M_qdV7f7.js";import{j as e}from"./vendor-ui-CyHRhpq7.js";import{loader as M}from"./vendor-editor-Dk98lJ2I.js";import{a as u}from"./vendor-react-C-h8dcES.js";const B=new URL("/demos/interview/pyodide/",window.location.origin).href;let m=null;function L(){if(m)return m;const o=`
    (async () => {
      try {
        importScripts(${JSON.stringify(`${B}pyodide.js`)});
        const pyodide = await loadPyodide({ indexURL: ${JSON.stringify(B)} });
        self.onmessage = async ({ data: code }) => {
          pyodide.runPython('import sys\\nfrom io import StringIO\\nsys.stdout = StringIO()\\nsys.stderr = StringIO()');
          let error;
          try {
            const result = await pyodide.runPythonAsync(code);
            result?.destroy?.();
          } catch (caught) {
            error = caught?.message || String(caught);
          }
          self.postMessage({
            stdout: pyodide.runPython('sys.stdout.getvalue()'),
            stderr: pyodide.runPython('sys.stderr.getvalue()'),
            error,
            success: !error,
          });
        };
        self.postMessage({ ready: true });
      } catch (error) {
        self.postMessage({ error: error?.message || String(error) });
      }
    })();
  `,t=URL.createObjectURL(new Blob([o],{type:"application/javascript"})),i=new Worker(t),l=()=>{i.terminate(),URL.revokeObjectURL(t)},c=new Promise((a,d)=>{const r=s=>{clearTimeout(f),l(),d(new Error(s))},f=setTimeout(()=>r("Python runtime loading timeout (30 seconds)"),3e4);i.onmessage=({data:s})=>{if(!s.ready)return r(s.error||"Failed to load Python runtime");clearTimeout(f),a({worker:i,dispose:l})},i.onerror=s=>r(s.message||"Failed to load Python runtime")});return m=c,c.catch(()=>{m===c&&(m=null)}),c}async function U(o,t=3e3){const i=performance.now(),l=`
    let stdout = '';
    let stderr = '';
    const blocked = () => { throw new Error('Browser/network APIs are disabled in the JavaScript sandbox'); };
    self.fetch = blocked;
    self.XMLHttpRequest = undefined;
    self.WebSocket = undefined;
    self.EventSource = undefined;
    self.importScripts = blocked;
    const customConsole = {
      log: (...args) => { stdout += args.map(String).join(' ') + '\\n'; },
      error: (...args) => { stderr += args.map(String).join(' ') + '\\n'; },
      warn: (...args) => { stdout += '[WARN] ' + args.map(String).join(' ') + '\\n'; },
      info: (...args) => { stdout += '[INFO] ' + args.map(String).join(' ') + '\\n'; },
      debug: (...args) => { stdout += '[DEBUG] ' + args.map(String).join(' ') + '\\n'; },
    };
    self.onmessage = (event) => {
      try {
        const fn = new Function('console', '"use strict";\\n' + event.data);
        fn(customConsole);
        self.postMessage({ stdout: stdout.trim(), stderr: stderr.trim(), success: true });
      } catch (error) {
        self.postMessage({ stdout: stdout.trim(), stderr: stderr.trim(), error: error?.message || String(error), success: false });
      }
    };
  `,c=new Blob([l],{type:"application/javascript"}),a=URL.createObjectURL(c),d=new Worker(a);return new Promise(r=>{const f=setTimeout(()=>{d.terminate(),URL.revokeObjectURL(a),r({stdout:"",stderr:"",error:`Execution timeout (${t/1e3} seconds)`,executionTime:performance.now()-i,success:!1})},t);d.onmessage=s=>{clearTimeout(f),d.terminate(),URL.revokeObjectURL(a),r({stdout:s.data.stdout||"",stderr:s.data.stderr||"",error:s.data.error,executionTime:performance.now()-i,success:s.data.success===!0})},d.onerror=s=>{clearTimeout(f),d.terminate(),URL.revokeObjectURL(a),r({stdout:"",stderr:"",error:s.message,executionTime:performance.now()-i,success:!1})},d.postMessage(o)})}async function N(o,t=3e3){const i=performance.now();try{const l=L();m=null,y.isReady=!1;const{worker:c,dispose:a}=await l;return await new Promise(d=>{const r=s=>{clearTimeout(f),a(),d({...s,executionTime:performance.now()-i})},f=setTimeout(()=>r({stdout:"",stderr:"",success:!1,error:`Execution timeout (${t/1e3} seconds)`}),t);c.onmessage=({data:s})=>r({stdout:s.stdout||"",stderr:s.stderr||"",error:s.error,success:s.success===!0}),c.onerror=s=>r({stdout:"",stderr:"",error:s.message||"Python worker failed",success:!1}),c.postMessage(o)})}catch(l){return{stdout:"",stderr:"",error:l.message||"Unknown error during Python execution",executionTime:performance.now()-i,success:!1}}}async function O(o,t){return{stdout:"",stderr:"",error:`当前未配置 ${{cpp:"C++",java:"Java",go:"Go"}[t]||t} 编译执行服务，代码仍可编辑，请复制到本地编译器运行。`,executionTime:0,success:!1}}function W(o,t){const i=[/while\s*\(\s*true\s*\)/i,/for\s*\(\s*;\s*;\s*\)/i,/eval\s*\(/,/Function\s*\(\s*["']/,/import\s*\(/,/require\s*\(/,/fetch\s*\(/i,/XMLHttpRequest/i,/WebSocket/i,/EventSource/i,/localStorage/i,/sessionStorage/i,/indexedDB/i,/document\./i,/window\./i,/navigator\./i,/location\./i,/process\./i,/child_process/i,/fs\./i,/os\./i,/require\s*\(\s*["']fs["']\s*\)/i,/require\s*\(\s*["']child_process["']\s*\)/i],l=[/import\s+os/i,/import\s+sys/i,/from\s+os\s+import/i,/from\s+sys\s+import/i,/__import__\s*\(/i,/exec\s*\(/i,/eval\s*\(/i,/open\s*\(/i,/file\s*\(/i,/subprocess/i,/socket\s*\(/i,/urllib/i,/requests/i],c=[/system\s*\(/i,/popen\s*\(/i,/execv\s*\(/i,/fork\s*\(/i,/vfork\s*\(/i,/pthread_create/i,/^\s*#include\s*<stdlib\.h>/im,/Runtime\.exec/i,/ProcessBuilder/i,/os\.exec/i,/os\.Command/i];let a=[];t==="javascript"?a=i:t==="python"?a=l:["cpp","java","go"].includes(t)&&(a=c);for(const r of a)if(r.test(o))return{safe:!1,reason:"Code contains potentially dangerous operations"};let d;return t==="javascript"?d=/while\s*\(\s*true\s*\)|for\s*\(\s*;\s*;\s*\)/:t==="python"?d=/while\s+True:|while\s*\(\s*1\s*\)/:d=/while\s*\(\s*true\s*\)|for\s*\(\s*;\s*;\s*\)|while\s*\(\s*1\s*\)/,d.test(o)?{safe:!1,reason:"Infinite loop detected"}:{safe:!0}}const y={isReady:!1,isLoading:!1,async loadPyodide(){this.isLoading=!0;try{const o=L();await o,this.isReady=m===o}catch(o){throw console.error("Failed to load Pyodide:",o),o}finally{this.isLoading=!1}},async execute(o,t){const i=W(o,t);if(!i.safe)return{stdout:"",stderr:"",error:i.reason,executionTime:0,success:!1};if(t==="cpp"||t==="java"||t==="go")return O(o,t);if(t==="javascript")return U(o);if(t==="python"){if(!this.isReady)try{await this.loadPyodide()}catch{return{stdout:"",stderr:"",error:"Failed to load Python runtime. Please check your internet connection.",executionTime:0,success:!1}}return N(o)}return{stdout:"",stderr:"",error:`Unsupported language: ${t}`,executionTime:0,success:!1}}};M.config({paths:{vs:"/demos/interview/monaco/vs"}});const E=u.lazy(()=>I(()=>import("./vendor-editor-Dk98lJ2I.js"),__vite__mapDeps([0,1])).then(o=>({default:o.default}))),_={python:"Python",javascript:"JavaScript",cpp:"C++",java:"Java",go:"Go"},R={python:`# 在这里编写 Python 代码
# 示例：计算斐波那契数列

def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# 计算前 10 个斐波那契数
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")
`,javascript:`// 在这里编写 JavaScript 代码
// 示例：计算斐波那契数列

function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

// 计算前 10 个斐波那契数
for (let i = 0; i < 10; i++) {
    console.log(\`F(\${i}) = \${fibonacci(i)}\`);
}
`,cpp:`// 在这里编写 C++ 代码
// 示例：计算斐波那契数列

#include <iostream>
using namespace std;

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n-1) + fibonacci(n-2);
}

int main() {
    // 计算前 10 个斐波那契数
    for (int i = 0; i < 10; i++) {
        cout << "F(" << i << ") = " << fibonacci(i) << endl;
    }
    return 0;
}
`,java:`// 在这里编写 Java 代码
// 示例：计算斐波那契数列

public class Main {
    public static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n-1) + fibonacci(n-2);
    }

    public static void main(String[] args) {
        // 计算前 10 个斐波那契数
        for (int i = 0; i < 10; i++) {
            System.out.println("F(" + i + ") = " + fibonacci(i));
        }
    }
}
`,go:`// 在这里编写 Go 代码
// 示例：计算斐波那契数列

package main

import "fmt"

func fibonacci(n int) int {
    if n <= 1 {
        return n
    }
    return fibonacci(n-1) + fibonacci(n-2)
}

func main() {
    // 计算前 10 个斐波那契数
    for i := 0; i < 10; i++ {
        fmt.Printf("F(%d) = %d\\n", i, fibonacci(i))
    }
}
`},G=({language:o="python",defaultValue:t,onCodeChange:i,onExecute:l,height:c=300,readOnly:a=!1,compact:d=!1})=>{const[r,f]=u.useState(o),[s,b]=u.useState(t||R[o]),[g,v]=u.useState(!1),[n,x]=u.useState(null),[P,j]=u.useState(!1),T=u.useRef(null);u.useEffect(()=>{t||b(R[r])},[r,t]);const w=(p,h)=>{T.current=p,h.editor.defineTheme("interview-dark",{base:"vs-dark",inherit:!0,rules:[{token:"comment",foreground:"6A9955",fontStyle:"italic"},{token:"keyword",foreground:"C586C0"},{token:"string",foreground:"CE9178"},{token:"number",foreground:"B5CEA8"},{token:"type",foreground:"4EC9B0"},{token:"function",foreground:"DCDCAA"},{token:"variable",foreground:"9CDCFE"}],colors:{"editor.background":"#0B1120","editor.foreground":"#E2E8F0","editor.lineHighlightBackground":"#1E293B","editor.selectionBackground":"#3B82F680","editorCursor.foreground":"#3B82F6","editorLineNumber.foreground":"#475569","editorLineNumber.activeForeground":"#94A3B8","editor.inactiveSelectionBackground":"#3B82F640"}}),h.editor.setTheme("interview-dark")},k=u.useCallback(p=>{const h=p||"";b(h),i==null||i(h)},[i]),z=u.useCallback(async()=>{if(!g){v(!0),x(null);try{r==="python"&&!y.isReady&&j(!0);const p=await y.execute(s,r);x(p),l==null||l(p)}catch(p){x({stdout:"",stderr:"",error:p.message||"Execution failed",executionTime:0,success:!1,complexityHint:void 0})}finally{v(!1),j(!1)}}},[s,r,g,l]),A=u.useCallback(()=>{x(null)},[]),S=e.jsx("div",{style:{display:"flex",alignItems:"center",gap:8},children:e.jsxs("select",{value:r,onChange:p=>f(p.target.value),disabled:a,style:{background:"rgba(30,41,59,0.8)",border:"1px solid rgba(51,65,85,0.5)",borderRadius:8,padding:"6px 12px",color:"#E2E8F0",fontSize:12,fontWeight:500,cursor:a?"not-allowed":"pointer",outline:"none"},children:[e.jsx("option",{value:"python",children:"Python"}),e.jsx("option",{value:"javascript",children:"JavaScript"}),e.jsx("option",{value:"cpp",children:"C++"}),e.jsx("option",{value:"java",children:"Java"}),e.jsx("option",{value:"go",children:"Go"})]})}),C=e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8},children:[(r==="python"||r==="javascript"||r==="cpp"||r==="java"||r==="go")&&e.jsx("button",{onClick:z,disabled:g||!s.trim(),className:g?"fx-button animate-soft-glow":"fx-button",style:{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",background:g?"rgba(59,130,246,0.5)":"linear-gradient(135deg, #3B82F6, #8B5CF6)",border:"none",borderRadius:8,color:"#fff",fontSize:12,fontWeight:600,cursor:g||!s.trim()?"not-allowed":"pointer",transition:"all 0.2s",boxShadow:g?"none":"0 4px 12px rgba(99,102,241,0.3)"},children:g?P?e.jsxs(e.Fragment,{children:[e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",style:{animation:"spin 1s linear infinite"},children:[e.jsx("circle",{cx:"12",cy:"12",r:"10",strokeOpacity:"0.3"}),e.jsx("path",{d:"M12 2a10 10 0 0 1 10 10"})]}),"Loading Python..."]}):e.jsxs(e.Fragment,{children:[e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",style:{animation:"spin 1s linear infinite"},children:[e.jsx("circle",{cx:"12",cy:"12",r:"10",strokeOpacity:"0.3"}),e.jsx("path",{d:"M12 2a10 10 0 0 1 10 10"})]}),"Running..."]}):e.jsxs(e.Fragment,{children:[e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"currentColor",children:e.jsx("path",{d:"M8 5v14l11-7z"})}),"Run Code"]})}),(r==="cpp"||r==="java"||r==="go")&&g&&e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,padding:"8px 12px",background:"rgba(59,130,246,0.1)",border:"1px solid rgba(59,130,246,0.3)",borderRadius:8,color:"#60A5FA",fontSize:12},children:[e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",style:{animation:"spin 1s linear infinite"},children:[e.jsx("circle",{cx:"12",cy:"12",r:"10",strokeOpacity:"0.3"}),e.jsx("path",{d:"M12 2a10 10 0 0 1 10 10"})]}),"编译中..."]}),n&&e.jsx("button",{onClick:A,className:"fx-button",style:{padding:"8px 12px",background:"rgba(30,41,59,0.8)",border:"1px solid rgba(51,65,85,0.5)",borderRadius:8,color:"#94A3B8",fontSize:12,cursor:"pointer",transition:"all 0.2s"},children:"Clear"})]}),F=n&&e.jsxs("div",{className:"fx-card animate-slide-in-up",style:{marginTop:12,borderRadius:12,overflow:"hidden",border:`1px solid ${n.success?"rgba(34,197,94,0.3)":"rgba(239,68,68,0.3)"}`,background:"rgba(5,12,25,0.8)"},children:[e.jsxs("div",{className:"fx-card",style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:n.success?"rgba(34,197,94,0.1)":"rgba(239,68,68,0.1)",borderBottom:`1px solid ${n.success?"rgba(34,197,94,0.2)":"rgba(239,68,68,0.2)"}`},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8},children:[n.success?e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"#10B981",strokeWidth:"2",children:e.jsx("path",{d:"M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"})}):e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"#EF4444",strokeWidth:"2",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("path",{d:"M15 9l-6 6M9 9l6 6"})]}),e.jsx("span",{style:{fontSize:12,fontWeight:600,color:n.success?"#10B981":"#EF4444"},children:n.success?"Execution Successful":"Execution Failed"})]}),e.jsxs("span",{style:{fontSize:11,color:"#64748B"},children:[n.executionTime.toFixed(2),"ms"]})]}),e.jsxs("div",{style:{padding:14},children:[n.stdout&&e.jsxs("div",{style:{marginBottom:n.stderr?12:0},children:[e.jsx("div",{style:{fontSize:11,fontWeight:600,color:"#64748B",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.05em"},children:"Output"}),e.jsx("pre",{style:{margin:0,padding:12,background:"rgba(30,41,59,0.5)",borderRadius:8,fontSize:13,fontFamily:"'Fira Code', 'Consolas', monospace",color:"#E2E8F0",whiteSpace:"pre-wrap",wordBreak:"break-word",maxHeight:200,overflowY:"auto"},children:n.stdout})]}),n.stderr&&e.jsxs("div",{children:[e.jsx("div",{style:{fontSize:11,fontWeight:600,color:"#EF4444",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.05em"},children:"Error"}),e.jsx("pre",{style:{margin:0,padding:12,background:"rgba(239,68,68,0.1)",borderRadius:8,fontSize:13,fontFamily:"'Fira Code', 'Consolas', monospace",color:"#FCA5A5",whiteSpace:"pre-wrap",wordBreak:"break-word"},children:n.stderr})]}),n.error&&e.jsx("div",{style:{padding:12,background:"rgba(239,68,68,0.1)",borderRadius:8,fontSize:13,color:"#FCA5A5",fontFamily:"'Fira Code', 'Consolas', monospace"},children:n.error}),n.complexityHint&&e.jsxs("div",{style:{marginTop:12,padding:"10px 12px",background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:8},children:[e.jsx("div",{style:{fontSize:11,fontWeight:600,color:"#10B981",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.05em"},children:"复杂度分析"}),e.jsxs("div",{style:{display:"flex",gap:16,fontSize:13},children:[e.jsxs("span",{style:{color:"#94A3B8"},children:["时间: ",e.jsx("span",{style:{color:"#E2E8F0",fontFamily:"'Fira Code', monospace"},children:n.complexityHint.time})]}),e.jsxs("span",{style:{color:"#94A3B8"},children:["空间: ",e.jsx("span",{style:{color:"#E2E8F0",fontFamily:"'Fira Code', monospace"},children:n.complexityHint.space})]})]})]})]})]});return d?e.jsxs("div",{className:"fx-card",style:{background:"rgba(15,23,42,0.7)",border:"1px solid rgba(51,65,85,0.5)",borderRadius:12,overflow:"hidden"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",borderBottom:"1px solid rgba(51,65,85,0.3)",background:"rgba(30,41,59,0.3)"},children:[S,C]}),e.jsx(u.Suspense,{fallback:e.jsx("div",{className:"h-48 flex items-center justify-center",style:{background:"#1e293b"},children:e.jsx("div",{className:"text-xs",style:{color:"#475569"},children:"加载编辑器..."})}),children:e.jsx(E,{height:typeof c=="number"?c:200,language:r,value:s,onChange:k,onMount:w,options:{minimap:{enabled:!1},fontSize:13,lineNumbers:"on",scrollBeyondLastLine:!1,automaticLayout:!0,tabSize:4,wordWrap:"on",readOnly:a,padding:{top:12,bottom:12}}})}),F]}):e.jsxs("div",{style:{background:"rgba(15,23,42,0.8)",border:"1px solid rgba(51,65,85,0.4)",borderRadius:16,overflow:"hidden",boxShadow:"0 8px 32px rgba(0,0,0,0.4)"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",borderBottom:"1px solid rgba(51,65,85,0.3)",background:"linear-gradient(180deg, rgba(30,41,59,0.5) 0%, rgba(15,23,42,0.3) 100%)"},children:[e.jsx("div",{style:{display:"flex",alignItems:"center",gap:12},children:e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8},children:[e.jsx("div",{style:{width:8,height:8,borderRadius:"50%",background:r==="python"?"#3572A5":r==="javascript"?"#F7DF1E":"#00599C",boxShadow:`0 0 8px ${r==="python"?"rgba(53,114,165,0.5)":r==="javascript"?"rgba(247,223,30,0.5)":"rgba(0,89,156,0.5)"}`}}),e.jsxs("span",{style:{fontSize:13,fontWeight:600,color:"#E2E8F0"},children:[_[r]," Code Editor"]})]})}),S]}),e.jsx(u.Suspense,{fallback:e.jsx("div",{className:"h-72 flex items-center justify-center",style:{background:"#1e293b"},children:e.jsx("div",{className:"text-xs",style:{color:"#475569"},children:"加载编辑器..."})}),children:e.jsx(E,{height:typeof c=="number"?c:300,language:r,value:s,onChange:k,onMount:w,options:{minimap:{enabled:!1},fontSize:14,lineNumbers:"on",scrollBeyondLastLine:!1,automaticLayout:!0,tabSize:4,wordWrap:"on",readOnly:a,padding:{top:16,bottom:16},scrollbar:{vertical:"auto",horizontal:"auto",verticalScrollbarSize:10,horizontalScrollbarSize:10}}})}),e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",borderTop:"1px solid rgba(51,65,85,0.3)",background:"rgba(30,41,59,0.2)"},children:[e.jsxs("div",{style:{fontSize:11,color:"#64748B"},children:[s.length," characters"]}),C]}),F]})};export{G as C};
