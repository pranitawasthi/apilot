// import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Send, Save, Upload, FileText, Trash2, Plus, X, LogIn, UserPlus, LogOut, Code, Zap } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Badge } from '@/components/ui/badge';
// import { Card } from '@/components/ui/card';

// const API_BASE = 'https://apilot-backend.onrender.com/api';

// const Index = () => {
//   const [user, setUser] = useState<any>(null);
//   const [authMode, setAuthMode] = useState<string | null>(null);
//   const [authForm, setAuthForm] = useState({ email: '', password: '' });
  
//   const [activeTab, setActiveTab] = useState('request');
//   const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts/1');
//   const [method, setMethod] = useState('GET');
//   const [headers, setHeaders] = useState([{ key: 'Content-Type', value: 'application/json' }]);
//   const [body, setBody] = useState('');
//   const [response, setResponse] = useState<any>(null);
//   const [loading, setLoading] = useState(false);
  
//   const [savedRequests, setSavedRequests] = useState<any[]>([]);
//   const [saveModal, setSaveModal] = useState(false);
//   const [saveName, setSaveName] = useState('');
//   const [saveDesc, setSaveDesc] = useState('');
  
//   const [curlInput, setCurlInput] = useState('');
//   const [collectionFile, setCollectionFile] = useState<any>(null);
//   const [parsedCollection, setParsedCollection] = useState<any>(null);

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     const userData = localStorage.getItem('user');
//     if (token && userData) {
//       setUser(JSON.parse(userData));
//       fetchSavedRequests(token);
//     }
//   }, []);

//   const handleAuth = async (isSignup: boolean) => {
//     try {
//       const res = await fetch(`${API_BASE}/auth/${isSignup ? 'signup' : 'signin'}`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(authForm)
//       });
//       const data = await res.json();
//       if (res.ok) {
//         localStorage.setItem('token', data.token);
//         localStorage.setItem('user', JSON.stringify(data.user));
//         setUser(data.user);
//         setAuthMode(null);
//         setAuthForm({ email: '', password: '' });
//         fetchSavedRequests(data.token);
//       } else {
//         alert(data.error || 'Authentication failed');
//       }
//     } catch (err: any) {
//       alert('Authentication error: ' + err.message);
//     }
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     setUser(null);
//     setSavedRequests([]);
//   };

//   const sendRequest = async () => {
//     setLoading(true);
//     const startTime = Date.now();
    
//     try {
//       const headerObj: any = {};
//       headers.forEach(h => {
//         if (h.key) headerObj[h.key] = h.value;
//       });

//       const options: any = {
//         method,
//         headers: headerObj
//       };

//       if (method !== 'GET' && body) {
//         options.body = body;
//       }

//       const res = await fetch(url, options);
//       const responseTime = Date.now() - startTime;
      
//       const responseHeaders: any = {};
//       res.headers.forEach((value, key) => {
//         responseHeaders[key] = value;
//       });

//       let responseBody;
//       const contentType = res.headers.get('content-type');
//       if (contentType && contentType.includes('application/json')) {
//         responseBody = await res.json();
//       } else {
//         responseBody = await res.text();
//       }

//       setResponse({
//         status: res.status,
//         statusText: res.statusText,
//         time: responseTime,
//         headers: responseHeaders,
//         body: responseBody
//       });
//     } catch (err: any) {
//       setResponse({
//         error: true,
//         message: err.message
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const saveRequest = async () => {
//     if (!user) {
//       alert('Please sign in to save requests');
//       return;
//     }

//     try {
//       const token = localStorage.getItem('token');
//       const res = await fetch(`${API_BASE}/requests`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify({
//           name: saveName,
//           description: saveDesc,
//           url,
//           method,
//           headers: JSON.stringify(headers),
//           body
//         })
//       });

//       if (res.ok) {
//         setSaveModal(false);
//         setSaveName('');
//         setSaveDesc('');
//         fetchSavedRequests(token!);
//         alert('Request saved successfully!');
//       } else {
//         alert('Failed to save request');
//       }
//     } catch (err: any) {
//       alert('Error saving request: ' + err.message);
//     }
//   };

//   const fetchSavedRequests = async (token: string) => {
//     try {
//       const res = await fetch(`${API_BASE}/requests`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
//       if (res.ok) {
//         const data = await res.json();
//         setSavedRequests(data);
//       }
//     } catch (err) {
//       console.error('Error fetching requests:', err);
//     }
//   };

//   const loadRequest = (req: any) => {
//     setUrl(req.url);
//     setMethod(req.method);
//     setHeaders(JSON.parse(req.headers));
//     setBody(req.body || '');
//     setActiveTab('request');
//   };

//   const deleteRequest = async (id: number) => {
//     if (!confirm('Delete this request?')) return;
    
//     try {
//       const token = localStorage.getItem('token');
//       const res = await fetch(`${API_BASE}/requests/${id}`, {
//         method: 'DELETE',
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
//       if (res.ok) {
//         fetchSavedRequests(token!);
//       }
//     } catch (err: any) {
//       alert('Error deleting request: ' + err.message);
//     }
//   };

//   const parseCurl = () => {
//     try {
//       let parsedMethod = 'GET';
//       let parsedUrl = '';
//       const parsedHeaders: any[] = [];
//       let parsedBody = '';

//       const methodMatch = curlInput.match(/-X\s+(\w+)/i);
//       if (methodMatch) parsedMethod = methodMatch[1];

//       const urlMatch = curlInput.match(/curl\s+(?:-X\s+\w+\s+)?["']?([^"'\s]+)/);
//       if (urlMatch) parsedUrl = urlMatch[1].replace(/["']/g, '');

//       const headerMatches = curlInput.matchAll(/-H\s+["']([^:]+):\s*([^"']+)["']/g);
//       for (const match of headerMatches) {
//         parsedHeaders.push({ key: match[1].trim(), value: match[2].trim() });
//       }

//       const bodyMatch = curlInput.match(/(?:-d|--data)\s+["'](.+?)["'](?:\s|$)/s);
//       if (bodyMatch) parsedBody = bodyMatch[1];

//       setMethod(parsedMethod);
//       setUrl(parsedUrl);
//       setHeaders(parsedHeaders.length > 0 ? parsedHeaders : [{ key: '', value: '' }]);
//       setBody(parsedBody);
//       setActiveTab('request');
//       setCurlInput('');
//       alert('cURL command parsed successfully!');
//     } catch (err: any) {
//       alert('Error parsing cURL: ' + err.message);
//     }
//   };

//   const parseCollection = (e: any) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = (event: any) => {
//       try {
//         const collection = JSON.parse(event.target.result);
//         const items = collection.item || [];
//         setParsedCollection(items);
//       } catch (err: any) {
//         alert('Error parsing collection: ' + err.message);
//       }
//     };
//     reader.readAsText(file);
//   };

//   const loadCollectionRequest = (item: any) => {
//     const req = item.request;
//     setUrl(req.url?.raw || req.url || '');
//     setMethod(req.method || 'GET');
    
//     const headerArray = req.header?.map((h: any) => ({ key: h.key, value: h.value })) || [];
//     setHeaders(headerArray.length > 0 ? headerArray : [{ key: '', value: '' }]);
    
//     const bodyData = req.body?.raw || '';
//     setBody(bodyData);
    
//     setActiveTab('request');
//     setParsedCollection(null);
//   };

//   const addHeader = () => {
//     setHeaders([...headers, { key: '', value: '' }]);
//   };

//   const updateHeader = (index: number, field: string, value: string) => {
//     const newHeaders = [...headers];
//     (newHeaders[index] as any)[field] = value;
//     setHeaders(newHeaders);
//   };

//   const removeHeader = (index: number) => {
//     setHeaders(headers.filter((_, i) => i !== index));
//   };

//   const getMethodColor = (method: string) => {
//     switch (method) {
//       case 'GET': return 'bg-success text-success-foreground';
//       case 'POST': return 'bg-primary text-primary-foreground';
//       case 'PUT': return 'bg-accent text-accent-foreground';
//       case 'DELETE': return 'bg-destructive text-destructive-foreground';
//       case 'PATCH': return 'bg-muted text-muted-foreground';
//       default: return 'bg-secondary text-secondary-foreground';
//     }
//   };

//   if (authMode) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
//         <motion.div
//           initial={{ opacity: 0, scale: 0.95 }}
//           animate={{ opacity: 1, scale: 1 }}
//           className="bg-card rounded-2xl shadow-elegant p-8 w-full max-w-md border border-border"
//         >
//           <div className="flex items-center justify-center mb-6">
//             <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent">
//               <Zap className="w-6 h-6 text-white" />
//             </div>
//           </div>
//           <h2 className="text-2xl font-bold mb-6 text-center text-foreground">
//             {authMode === 'signup' ? 'Create Account' : 'Welcome Back'}
//           </h2>
//           <Input
//             type="email"
//             placeholder="Email"
//             className="mb-4"
//             value={authForm.email}
//             onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
//           />
//           <Input
//             type="password"
//             placeholder="Password"
//             className="mb-6"
//             value={authForm.password}
//             onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
//           />
//           <Button
//             onClick={() => handleAuth(authMode === 'signup')}
//             className="w-full mb-3 bg-gradient-to-r from-primary to-accent hover:shadow-elegant transition-all"
//           >
//             {authMode === 'signup' ? 'Sign Up' : 'Sign In'}
//           </Button>
//           <Button
//             onClick={() => setAuthMode(null)}
//             variant="outline"
//             className="w-full"
//           >
//             Cancel
//           </Button>
//         </motion.div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
//       {/* Header */}
//       <header className="bg-card/80 backdrop-blur-lg shadow-card border-b border-border sticky top-0 z-50">
//         <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
//           <div className="flex items-center gap-3">
//             <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
//               <Zap className="w-5 h-5 text-white" />
//             </div>
//             <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
//               API Tester
//             </h1>
//           </div>
//           <div className="flex gap-3">
//             {user ? (
//               <>
//                 <div className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground font-medium">
//                   {user.email}
//                 </div>
//                 <Button
//                   onClick={handleLogout}
//                   variant="outline"
//                   className="gap-2"
//                 >
//                   <LogOut size={16} /> Logout
//                 </Button>
//               </>
//             ) : (
//               <>
//                 <Button
//                   onClick={() => setAuthMode('signin')}
//                   variant="outline"
//                   className="gap-2"
//                 >
//                   <LogIn size={16} /> Sign In
//                 </Button>
//                 <Button
//                   onClick={() => setAuthMode('signup')}
//                   className="gap-2 bg-gradient-to-r from-primary to-accent hover:shadow-elegant transition-all"
//                 >
//                   <UserPlus size={16} /> Sign Up
//                 </Button>
//               </>
//             )}
//           </div>
//         </div>
//       </header>
      
//       <main className="max-w-7xl mx-auto px-6 py-8">
//         <Card className="shadow-card border-border overflow-hidden">
//           {/* Tabs */}
//           <div className="flex border-b border-border bg-muted/30">
//             {[
//               { id: 'request', label: 'API Request', icon: Send },
//               { id: 'saved', label: 'Saved', icon: Save },
//               { id: 'import', label: 'Import', icon: Upload }
//             ].map((tab) => (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 className={`flex items-center gap-2 px-6 py-4 font-medium transition-all relative ${
//                   activeTab === tab.id
//                     ? 'text-primary bg-card'
//                     : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
//                 }`}
//               >
//                 <tab.icon size={16} />
//                 {tab.label}
//                 {activeTab === tab.id && (
//                   <motion.div
//                     layoutId="activeTab"
//                     className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent"
//                   />
//                 )}
//               </button>
//             ))}
//           </div>

//           <div className="p-6">
//             <AnimatePresence mode="wait">
//               {activeTab === 'request' && (
//                 <motion.div
//                   key="request"
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, y: -10 }}
//                   transition={{ duration: 0.2 }}
//                 >
//                   {/* Request Builder */}
//                   <div className="flex gap-3 mb-6">
//                     <select
//                       value={method}
//                       onChange={(e) => setMethod(e.target.value)}
//                       className={`px-4 py-3 rounded-lg font-bold border-2 border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all ${getMethodColor(method)}`}
//                     >
//                       <option value="GET">GET</option>
//                       <option value="POST">POST</option>
//                       <option value="PUT">PUT</option>
//                       <option value="DELETE">DELETE</option>
//                       <option value="PATCH">PATCH</option>
//                     </select>
//                     <Input
//                       type="text"
//                       value={url}
//                       onChange={(e) => setUrl(e.target.value)}
//                       placeholder="Enter request URL"
//                       className="flex-1 text-base"
//                     />
//                     <Button
//                       onClick={sendRequest}
//                       disabled={loading}
//                       className="gap-2 bg-gradient-to-r from-primary to-accent hover:shadow-elegant transition-all min-w-[120px]"
//                     >
//                       <Send size={16} /> {loading ? 'Sending...' : 'Send'}
//                     </Button>
//                     <Button
//                       onClick={() => setSaveModal(true)}
//                       variant="outline"
//                       className="gap-2"
//                     >
//                       <Save size={16} />
//                     </Button>
//                   </div>

//                   {/* Headers */}
//                   <div className="mb-6">
//                     <div className="flex justify-between items-center mb-3">
//                       <h3 className="font-bold text-lg text-foreground">Headers</h3>
//                       <Button onClick={addHeader} variant="outline" size="sm" className="gap-2">
//                         <Plus size={14} /> Add Header
//                       </Button>
//                     </div>
//                     <div className="space-y-2">
//                       {headers.map((header, index) => (
//                         <motion.div
//                           key={index}
//                           initial={{ opacity: 0, x: -10 }}
//                           animate={{ opacity: 1, x: 0 }}
//                           className="flex gap-2"
//                         >
//                           <Input
//                             type="text"
//                             placeholder="Key"
//                             value={header.key}
//                             onChange={(e) => updateHeader(index, 'key', e.target.value)}
//                             className="flex-1"
//                           />
//                           <Input
//                             type="text"
//                             placeholder="Value"
//                             value={header.value}
//                             onChange={(e) => updateHeader(index, 'value', e.target.value)}
//                             className="flex-1"
//                           />
//                           <Button
//                             onClick={() => removeHeader(index)}
//                             variant="outline"
//                             size="icon"
//                             className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
//                           >
//                             <X size={16} />
//                           </Button>
//                         </motion.div>
//                       ))}
//                     </div>
//                   </div>

//                   {/* Body */}
//                   {method !== 'GET' && (
//                     <div className="mb-6">
//                       <h3 className="font-bold text-lg text-foreground mb-3">Request Body</h3>
//                       <textarea
//                         value={body}
//                         onChange={(e) => setBody(e.target.value)}
//                         placeholder='{"key": "value"}'
//                         className="w-full px-4 py-3 border-2 border-border rounded-lg font-mono text-sm h-40 bg-code-bg text-code-text focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
//                       />
//                     </div>
//                   )}

//                   {/* Response */}
//                   {response && (
//                     <motion.div
//                       initial={{ opacity: 0, y: 20 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       className="mt-8"
//                     >
//                       <h3 className="font-bold text-xl text-foreground mb-4">Response</h3>
//                       {response.error ? (
//                         <div className="bg-destructive/10 border-2 border-destructive rounded-xl p-6 text-destructive">
//                           <p className="font-bold mb-2">Error</p>
//                           <p>{response.message}</p>
//                         </div>
//                       ) : (
//                         <div className="space-y-4">
//                           <div className="flex gap-4 items-center">
//                             <Badge className={`text-base px-4 py-2 ${response.status < 400 ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'}`}>
//                               {response.status} {response.statusText}
//                             </Badge>
//                             <Badge variant="outline" className="text-base px-4 py-2">
//                               {response.time}ms
//                             </Badge>
//                           </div>
                          
//                           <div>
//                             <h4 className="font-semibold text-sm mb-2 text-muted-foreground uppercase tracking-wide">Response Headers</h4>
//                             <pre className="bg-code-bg text-code-text p-4 rounded-lg text-xs overflow-auto max-h-48 border border-border">
//                               {JSON.stringify(response.headers, null, 2)}
//                             </pre>
//                           </div>
                          
//                           <div>
//                             <h4 className="font-semibold text-sm mb-2 text-muted-foreground uppercase tracking-wide">Response Body</h4>
//                             <pre className="bg-code-bg text-code-text p-4 rounded-lg text-xs overflow-auto max-h-96 border border-border">
//                               {typeof response.body === 'object' 
//                                 ? JSON.stringify(response.body, null, 2)
//                                 : response.body}
//                             </pre>
//                           </div>
//                         </div>
//                       )}
//                     </motion.div>
//                   )}
//                 </motion.div>
//               )}

//               {activeTab === 'saved' && (
//                 <motion.div
//                   key="saved"
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, y: -10 }}
//                   transition={{ duration: 0.2 }}
//                 >
//                   {!user ? (
//                     <div className="text-center py-16">
//                       <div className="p-4 rounded-full bg-muted inline-block mb-4">
//                         <Save className="w-8 h-8 text-muted-foreground" />
//                       </div>
//                       <p className="text-muted-foreground text-lg">Please sign in to view saved requests</p>
//                     </div>
//                   ) : savedRequests.length === 0 ? (
//                     <div className="text-center py-16">
//                       <div className="p-4 rounded-full bg-muted inline-block mb-4">
//                         <FileText className="w-8 h-8 text-muted-foreground" />
//                       </div>
//                       <p className="text-muted-foreground text-lg">No saved requests yet</p>
//                     </div>
//                   ) : (
//                     <div className="space-y-3">
//                       {savedRequests.map((req, idx) => (
//                         <motion.div
//                           key={req.id}
//                           initial={{ opacity: 0, y: 10 }}
//                           animate={{ opacity: 1, y: 0 }}
//                           transition={{ delay: idx * 0.05 }}
//                           className="flex items-center justify-between p-5 border-2 border-border rounded-xl hover:border-primary hover:shadow-card transition-all cursor-pointer group"
//                           onClick={() => loadRequest(req)}
//                         >
//                           <div className="flex-1">
//                             <div className="flex items-center gap-3 mb-2">
//                               <Badge className={`${getMethodColor(req.method)} font-bold`}>
//                                 {req.method}
//                               </Badge>
//                               <span className="font-bold text-foreground group-hover:text-primary transition-colors">{req.name}</span>
//                             </div>
//                             <div className="text-sm text-muted-foreground font-mono">{req.url}</div>
//                             {req.description && (
//                               <div className="text-sm text-muted-foreground mt-1">{req.description}</div>
//                             )}
//                           </div>
//                           <Button
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               deleteRequest(req.id);
//                             }}
//                             variant="outline"
//                             size="icon"
//                             className="text-destructive hover:bg-destructive hover:text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
//                           >
//                             <Trash2 size={16} />
//                           </Button>
//                         </motion.div>
//                       ))}
//                     </div>
//                   )}
//                 </motion.div>
//               )}

//               {activeTab === 'import' && (
//                 <motion.div
//                   key="import"
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, y: -10 }}
//                   transition={{ duration: 0.2 }}
//                   className="space-y-8"
//                 >
//                   {/* cURL Import */}
//                   <div>
//                     <div className="flex items-center gap-2 mb-4">
//                       <Code className="w-5 h-5 text-primary" />
//                       <h3 className="font-bold text-xl text-foreground">Import from cURL</h3>
//                     </div>
//                     <textarea
//                       value={curlInput}
//                       onChange={(e) => setCurlInput(e.target.value)}
//                       placeholder="curl -X GET 'https://api.example.com/data' -H 'Authorization: Bearer token'"
//                       className="w-full px-4 py-3 border-2 border-border rounded-lg font-mono text-sm h-32 bg-code-bg text-code-text focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none mb-4"
//                     />
//                     <Button
//                       onClick={parseCurl}
//                       className="gap-2 bg-gradient-to-r from-primary to-accent hover:shadow-elegant transition-all"
//                     >
//                       <Code size={16} /> Parse cURL
//                     </Button>
//                   </div>

//                   {/* Collection Import */}
//                   <div>
//                     <div className="flex items-center gap-2 mb-4">
//                       <Upload className="w-5 h-5 text-primary" />
//                       <h3 className="font-bold text-xl text-foreground">Import Postman Collection</h3>
//                     </div>
//                     <input
//                       type="file"
//                       accept=".json"
//                       onChange={parseCollection}
//                       className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer cursor-pointer mb-4"
//                     />
//                     {parsedCollection && (
//                       <motion.div
//                         initial={{ opacity: 0, y: 10 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         className="mt-6 space-y-3"
//                       >
//                         <h4 className="font-bold text-lg text-foreground">Collection Requests</h4>
//                         {parsedCollection.map((item: any, index: number) => (
//                           <div
//                             key={index}
//                             onClick={() => loadCollectionRequest(item)}
//                             className="p-5 border-2 border-border rounded-xl hover:border-primary hover:shadow-card transition-all cursor-pointer group"
//                           >
//                             <div className="flex items-center gap-3">
//                               <Badge className={`${getMethodColor(item.request?.method || 'GET')} font-bold`}>
//                                 {item.request?.method || 'GET'}
//                               </Badge>
//                               <span className="font-bold text-foreground group-hover:text-primary transition-colors">{item.name}</span>
//                             </div>
//                           </div>
//                         ))}
//                       </motion.div>
//                     )}
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>
//         </Card>
//       </main>

//       {/* Save Modal */}
//       <AnimatePresence>
//         {saveModal && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
//             onClick={() => setSaveModal(false)}
//           >
//             <motion.div
//               initial={{ scale: 0.95, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.95, opacity: 0 }}
//               onClick={(e) => e.stopPropagation()}
//               className="bg-card rounded-2xl p-6 w-full max-w-md shadow-elegant border border-border"
//             >
//               <h3 className="text-2xl font-bold mb-6 text-foreground">Save Request</h3>
//               <Input
//                 type="text"
//                 placeholder="Request Name"
//                 value={saveName}
//                 onChange={(e) => setSaveName(e.target.value)}
//                 className="mb-4"
//               />
//               <textarea
//                 placeholder="Description (optional)"
//                 value={saveDesc}
//                 onChange={(e) => setSaveDesc(e.target.value)}
//                 className="w-full px-4 py-3 border-2 border-border rounded-lg text-sm h-24 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none mb-6"
//               />
//               <div className="flex gap-3">
//                 <Button
//                   onClick={saveRequest}
//                   className="flex-1 bg-gradient-to-r from-primary to-accent hover:shadow-elegant transition-all"
//                 >
//                   Save
//                 </Button>
//                 <Button
//                   onClick={() => setSaveModal(false)}
//                   variant="outline"
//                   className="flex-1"
//                 >
//                   Cancel
//                 </Button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default Index;


import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Save, Upload, FileText, Trash2, Plus, X, LogIn, UserPlus, LogOut, Code, Zap, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

const API_BASE = 'https://apilot-backend.onrender.com/api';

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [authMode, setAuthMode] = useState<string | null>(null);
  const [authForm, setAuthForm] = useState({ email: '', password: '' });
  
  const [activeTab, setActiveTab] = useState('request');
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts/1');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState([{ key: 'Content-Type', value: 'application/json' }]);
  const [body, setBody] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const [savedRequests, setSavedRequests] = useState<any[]>([]);
  const [saveModal, setSaveModal] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDesc, setSaveDesc] = useState('');
  
  const [curlInput, setCurlInput] = useState('');
  const [collectionFile, setCollectionFile] = useState<any>(null);
  const [parsedCollection, setParsedCollection] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
      fetchSavedRequests(token);
    }
  }, []);

  const handleAuth = async (isSignup: boolean) => {
    try {
      const res = await fetch(`${API_BASE}/auth/${isSignup ? 'signup' : 'signin'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setAuthMode(null);
        setAuthForm({ email: '', password: '' });
        fetchSavedRequests(data.token);
      } else {
        alert(data.error || 'Authentication failed');
      }
    } catch (err: any) {
      alert('Authentication error: ' + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setSavedRequests([]);
  };

  const sendRequest = async () => {
    setLoading(true);
    const startTime = Date.now();
    
    try {
      const headerObj: any = {};
      headers.forEach(h => {
        if (h.key) headerObj[h.key] = h.value;
      });

      const options: any = {
        method,
        headers: headerObj
      };

      if (method !== 'GET' && body) {
        options.body = body;
      }

      const res = await fetch(url, options);
      const responseTime = Date.now() - startTime;
      
      const responseHeaders: any = {};
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      let responseBody;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseBody = await res.json();
      } else {
        responseBody = await res.text();
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        time: responseTime,
        headers: responseHeaders,
        body: responseBody
      });
    } catch (err: any) {
      setResponse({
        error: true,
        message: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  const saveRequest = async () => {
    if (!user) {
      alert('Please sign in to save requests');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: saveName,
          description: saveDesc,
          url,
          method,
          headers: JSON.stringify(headers),
          body
        })
      });

      if (res.ok) {
        setSaveModal(false);
        setSaveName('');
        setSaveDesc('');
        fetchSavedRequests(token!);
        alert('Request saved successfully!');
      } else {
        alert('Failed to save request');
      }
    } catch (err: any) {
      alert('Error saving request: ' + err.message);
    }
  };

  const fetchSavedRequests = async (token: string) => {
    try {
      const res = await fetch(`${API_BASE}/requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSavedRequests(data);
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
    }
  };

  const loadRequest = (req: any) => {
    setUrl(req.url);
    setMethod(req.method);
    setHeaders(JSON.parse(req.headers));
    setBody(req.body || '');
    setActiveTab('request');
    setMobileMenuOpen(false);
  };

  const deleteRequest = async (id: number) => {
    if (!confirm('Delete this request?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/requests/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchSavedRequests(token!);
      }
    } catch (err: any) {
      alert('Error deleting request: ' + err.message);
    }
  };

  const parseCurl = () => {
    try {
      let parsedMethod = 'GET';
      let parsedUrl = '';
      const parsedHeaders: any[] = [];
      let parsedBody = '';

      const methodMatch = curlInput.match(/-X\s+(\w+)/i);
      if (methodMatch) parsedMethod = methodMatch[1];

      const urlMatch = curlInput.match(/curl\s+(?:-X\s+\w+\s+)?["']?([^"'\s]+)/);
      if (urlMatch) parsedUrl = urlMatch[1].replace(/["']/g, '');

      const headerMatches = curlInput.matchAll(/-H\s+["']([^:]+):\s*([^"']+)["']/g);
      for (const match of headerMatches) {
        parsedHeaders.push({ key: match[1].trim(), value: match[2].trim() });
      }

      const bodyMatch = curlInput.match(/(?:-d|--data)\s+["'](.+?)["'](?:\s|$)/s);
      if (bodyMatch) parsedBody = bodyMatch[1];

      setMethod(parsedMethod);
      setUrl(parsedUrl);
      setHeaders(parsedHeaders.length > 0 ? parsedHeaders : [{ key: '', value: '' }]);
      setBody(parsedBody);
      setActiveTab('request');
      setCurlInput('');
      setMobileMenuOpen(false);
      alert('cURL command parsed successfully!');
    } catch (err: any) {
      alert('Error parsing cURL: ' + err.message);
    }
  };

  const parseCollection = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event: any) => {
      try {
        const collection = JSON.parse(event.target.result);
        const items = collection.item || [];
        setParsedCollection(items);
      } catch (err: any) {
        alert('Error parsing collection: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const loadCollectionRequest = (item: any) => {
    const req = item.request;
    setUrl(req.url?.raw || req.url || '');
    setMethod(req.method || 'GET');
    
    const headerArray = req.header?.map((h: any) => ({ key: h.key, value: h.value })) || [];
    setHeaders(headerArray.length > 0 ? headerArray : [{ key: '', value: '' }]);
    
    const bodyData = req.body?.raw || '';
    setBody(bodyData);
    
    setActiveTab('request');
    setParsedCollection(null);
    setMobileMenuOpen(false);
  };

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const updateHeader = (index: number, field: string, value: string) => {
    const newHeaders = [...headers];
    (newHeaders[index] as any)[field] = value;
    setHeaders(newHeaders);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-success text-success-foreground';
      case 'POST': return 'bg-primary text-primary-foreground';
      case 'PUT': return 'bg-accent text-accent-foreground';
      case 'DELETE': return 'bg-destructive text-destructive-foreground';
      case 'PATCH': return 'bg-muted text-muted-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  if (authMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card rounded-2xl shadow-elegant p-6 sm:p-8 w-full max-w-md border border-border"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent">
              <Zap className="w-6 h-6 text-white" />
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center text-foreground">
            {authMode === 'signup' ? 'Create Account' : 'Welcome Back'}
          </h2>
          <Input
            type="email"
            placeholder="Email"
            className="mb-4"
            value={authForm.email}
            onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
          />
          <Input
            type="password"
            placeholder="Password"
            className="mb-6"
            value={authForm.password}
            onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
          />
          <Button
            onClick={() => handleAuth(authMode === 'signup')}
            className="w-full mb-3 bg-gradient-to-r from-primary to-accent hover:shadow-elegant transition-all"
          >
            {authMode === 'signup' ? 'Sign Up' : 'Sign In'}
          </Button>
          <Button
            onClick={() => setAuthMode(null)}
            variant="outline"
            className="w-full"
          >
            Cancel
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-lg shadow-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              API Tester
            </h1>
          </div>
          
          {/* Mobile Menu Button */}
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu size={16} />
          </Button>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex gap-3">
            {user ? (
              <>
                <div className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground font-medium text-sm">
                  {user.email}
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="gap-2"
                >
                  <LogOut size={16} /> Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => setAuthMode('signin')}
                  variant="outline"
                  className="gap-2"
                >
                  <LogIn size={16} /> Sign In
                </Button>
                <Button
                  onClick={() => setAuthMode('signup')}
                  className="gap-2 bg-gradient-to-r from-primary to-accent hover:shadow-elegant transition-all"
                >
                  <UserPlus size={16} /> Sign Up
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Auth Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-border bg-card/95 backdrop-blur-lg"
            >
              <div className="px-4 py-4 space-y-3">
                {user ? (
                  <>
                    <div className="px-3 py-2 rounded-lg bg-secondary text-secondary-foreground font-medium text-sm text-center">
                      {user.email}
                    </div>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="w-full gap-2"
                    >
                      <LogOut size={16} /> Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => setAuthMode('signin')}
                      variant="outline"
                      className="w-full gap-2"
                    >
                      <LogIn size={16} /> Sign In
                    </Button>
                    <Button
                      onClick={() => setAuthMode('signup')}
                      className="w-full gap-2 bg-gradient-to-r from-primary to-accent hover:shadow-elegant transition-all"
                    >
                      <UserPlus size={16} /> Sign Up
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Card className="shadow-card border-border overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-border bg-muted/30 overflow-x-auto">
            {[
              { id: 'request', label: 'API Request', icon: Send },
              { id: 'saved', label: 'Saved', icon: Save },
              { id: 'import', label: 'Import', icon: Upload }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 font-medium transition-all relative flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'text-primary bg-card'
                    : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                }`}
              >
                <tab.icon size={16} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="p-4 sm:p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'request' && (
                <motion.div
                  key="request"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Request Builder */}
                  <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <select
                      value={method}
                      onChange={(e) => setMethod(e.target.value)}
                      className={`px-3 sm:px-4 py-3 rounded-lg font-bold border-2 border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all flex-shrink-0 w-full sm:w-auto ${getMethodColor(method)}`}
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                      <option value="PATCH">PATCH</option>
                    </select>
                    <Input
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="Enter request URL"
                      className="flex-1 text-base min-w-0"
                    />
                    <div className="flex gap-2 sm:gap-3">
                      <Button
                        onClick={sendRequest}
                        disabled={loading}
                        className="gap-2 bg-gradient-to-r from-primary to-accent hover:shadow-elegant transition-all flex-1 sm:flex-none sm:min-w-[120px]"
                      >
                        <Send size={16} /> 
                        <span className="hidden sm:inline">{loading ? 'Sending...' : 'Send'}</span>
                        <span className="sm:hidden">{loading ? '...' : 'Send'}</span>
                      </Button>
                      <Button
                        onClick={() => setSaveModal(true)}
                        variant="outline"
                        className="gap-2 flex-shrink-0"
                        size="icon"
                      >
                        <Save size={16} />
                      </Button>
                    </div>
                  </div>

                  {/* Headers */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-bold text-lg text-foreground">Headers</h3>
                      <Button onClick={addHeader} variant="outline" size="sm" className="gap-2">
                        <Plus size={14} /> <span className="hidden sm:inline">Add Header</span>
                        <span className="sm:hidden">Add</span>
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {headers.map((header, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex flex-col sm:flex-row gap-2"
                        >
                          <Input
                            type="text"
                            placeholder="Key"
                            value={header.key}
                            onChange={(e) => updateHeader(index, 'key', e.target.value)}
                            className="flex-1"
                          />
                          <Input
                            type="text"
                            placeholder="Value"
                            value={header.value}
                            onChange={(e) => updateHeader(index, 'value', e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            onClick={() => removeHeader(index)}
                            variant="outline"
                            size="icon"
                            className="text-destructive hover:bg-destructive hover:text-destructive-foreground sm:self-auto self-end"
                          >
                            <X size={16} />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Body */}
                  {method !== 'GET' && (
                    <div className="mb-6">
                      <h3 className="font-bold text-lg text-foreground mb-3">Request Body</h3>
                      <textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder='{"key": "value"}'
                        className="w-full px-4 py-3 border-2 border-border rounded-lg font-mono text-sm h-40 bg-code-bg text-code-text focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                      />
                    </div>
                  )}

                  {/* Response */}
                  {response && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-8"
                    >
                      <h3 className="font-bold text-xl text-foreground mb-4">Response</h3>
                      {response.error ? (
                        <div className="bg-destructive/10 border-2 border-destructive rounded-xl p-4 sm:p-6 text-destructive">
                          <p className="font-bold mb-2">Error</p>
                          <p>{response.message}</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex flex-wrap gap-2 sm:gap-4 items-center">
                            <Badge className={`text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2 ${response.status < 400 ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'}`}>
                              {response.status} {response.statusText}
                            </Badge>
                            <Badge variant="outline" className="text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2">
                              {response.time}ms
                            </Badge>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-sm mb-2 text-muted-foreground uppercase tracking-wide">Response Headers</h4>
                            <pre className="bg-code-bg text-code-text p-3 sm:p-4 rounded-lg text-xs overflow-auto max-h-48 border border-border">
                              {JSON.stringify(response.headers, null, 2)}
                            </pre>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-sm mb-2 text-muted-foreground uppercase tracking-wide">Response Body</h4>
                            <pre className="bg-code-bg text-code-text p-3 sm:p-4 rounded-lg text-xs overflow-auto max-h-96 border border-border">
                              {typeof response.body === 'object' 
                                ? JSON.stringify(response.body, null, 2)
                                : response.body}
                            </pre>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              )}

              {activeTab === 'saved' && (
                <motion.div
                  key="saved"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {!user ? (
                    <div className="text-center py-12 sm:py-16">
                      <div className="p-4 rounded-full bg-muted inline-block mb-4">
                        <Save className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground text-lg">Please sign in to view saved requests</p>
                    </div>
                  ) : savedRequests.length === 0 ? (
                    <div className="text-center py-12 sm:py-16">
                      <div className="p-4 rounded-full bg-muted inline-block mb-4">
                        <FileText className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground text-lg">No saved requests yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {savedRequests.map((req, idx) => (
                        <motion.div
                          key={req.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 border-2 border-border rounded-xl hover:border-primary hover:shadow-card transition-all cursor-pointer group gap-3"
                          onClick={() => loadRequest(req)}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <Badge className={`${getMethodColor(req.method)} font-bold text-sm`}>
                                {req.method}
                              </Badge>
                              <span className="font-bold text-foreground group-hover:text-primary transition-colors truncate">{req.name}</span>
                            </div>
                            <div className="text-sm text-muted-foreground font-mono truncate">{req.url}</div>
                            {req.description && (
                              <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{req.description}</div>
                            )}
                          </div>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteRequest(req.id);
                            }}
                            variant="outline"
                            size="icon"
                            className="text-destructive hover:bg-destructive hover:text-destructive-foreground opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity self-end sm:self-auto flex-shrink-0"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'import' && (
                <motion.div
                  key="import"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8"
                >
                  {/* cURL Import */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Code className="w-5 h-5 text-primary" />
                      <h3 className="font-bold text-lg sm:text-xl text-foreground">Import from cURL</h3>
                    </div>
                    <textarea
                      value={curlInput}
                      onChange={(e) => setCurlInput(e.target.value)}
                      placeholder="curl -X GET 'https://api.example.com/data' -H 'Authorization: Bearer token'"
                      className="w-full px-4 py-3 border-2 border-border rounded-lg font-mono text-sm h-32 bg-code-bg text-code-text focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none mb-4"
                    />
                    <Button
                      onClick={parseCurl}
                      className="gap-2 bg-gradient-to-r from-primary to-accent hover:shadow-elegant transition-all w-full sm:w-auto"
                    >
                      <Code size={16} /> Parse cURL
                    </Button>
                  </div>

                  {/* Collection Import */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Upload className="w-5 h-5 text-primary" />
                      <h3 className="font-bold text-lg sm:text-xl text-foreground">Import Postman Collection</h3>
                    </div>
                    <input
                      type="file"
                      accept=".json"
                      onChange={parseCollection}
                      className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer cursor-pointer mb-4"
                    />
                    {parsedCollection && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 space-y-3"
                      >
                        <h4 className="font-bold text-lg text-foreground">Collection Requests</h4>
                        {parsedCollection.map((item: any, index: number) => (
                          <div
                            key={index}
                            onClick={() => loadCollectionRequest(item)}
                            className="p-4 sm:p-5 border-2 border-border rounded-xl hover:border-primary hover:shadow-card transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-3 flex-wrap">
                              <Badge className={`${getMethodColor(item.request?.method || 'GET')} font-bold text-sm`}>
                                {item.request?.method || 'GET'}
                              </Badge>
                              <span className="font-bold text-foreground group-hover:text-primary transition-colors truncate flex-1 min-w-0">
                                {item.name}
                              </span>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </main>

      {/* Save Modal */}
      <AnimatePresence>
        {saveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSaveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl p-4 sm:p-6 w-full max-w-md shadow-elegant border border-border mx-4"
            >
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-foreground">Save Request</h3>
              <Input
                type="text"
                placeholder="Request Name"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                className="mb-4"
              />
              <textarea
                placeholder="Description (optional)"
                value={saveDesc}
                onChange={(e) => setSaveDesc(e.target.value)}
                className="w-full px-4 py-3 border-2 border-border rounded-lg text-sm h-24 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none mb-4 sm:mb-6"
              />
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={saveRequest}
                  className="flex-1 bg-gradient-to-r from-primary to-accent hover:shadow-elegant transition-all"
                >
                  Save
                </Button>
                <Button
                  onClick={() => setSaveModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;