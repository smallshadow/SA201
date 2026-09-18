/* SA201 viewer. Geometry exported from the supplied SketchUp model, in millimetres. */
(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const viewport = $('#viewport');
  try {
    const T = window.THREE;
    if (!T || !window.OrbitControls || !window.SA201_MODEL) throw new Error('Missing local model or viewer files');
    const renderer = new T.WebGLRenderer({antialias:true, alpha:true});
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.setClearColor(0xe9eef4,1);
    viewport.prepend(renderer.domElement);
    renderer.domElement.setAttribute('aria-label','警衛室棟 3D 模型，可拖曳旋轉及縮放');
    renderer.domElement.tabIndex = 0;
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(36,1,10,150000);
    const controls = new window.OrbitControls(camera,renderer.domElement);
    controls.enableDamping=true;controls.dampingFactor=.08;controls.minDistance=1200;controls.maxDistance=38000;controls.maxPolarAngle=Math.PI*.98;controls.autoRotateSpeed=.65;
    controls.listenToKeyEvents(renderer.domElement);
    scene.add(new T.HemisphereLight(0xffffff,0xa0aabb,2.25));
    const key=new T.DirectionalLight(0xffffff,2.1);key.position.set(4000,9000,6500);scene.add(key);
    const fill=new T.DirectionalLight(0xd5e7ff,.75);fill.position.set(-7000,4000,-5000);scene.add(fill);
    const model=new T.Group();scene.add(model);
    const config={
      '01':{id:'base',label:'基座與地坪',offset:[0,-1600,0]},
      '02':{id:'floor',label:'地坪分縫',offset:[0,-1600,0]},
      '03':{id:'walls',label:'牆體與隔間',offset:[0,0,0]},
      '04':{id:'openings',label:'門窗',offset:[2300,150,600]},
      '05':{id:'roof',label:'屋頂與雨遮',offset:[0,2900,0]},
      '06':{id:'furniture',label:'室內桌櫃',offset:[-2400,100,400]},
      '07':{id:'screen',label:'後方格柵',offset:[0,0,-2400]},
      '08':{id:'drain',label:'排水管',offset:[3200,0,-800]},
      '09':{id:'details',label:'外牆收邊',offset:[0,0,0]}
    };
    const parts=[];
    const lineMaterial=new T.LineBasicMaterial({color:0x344355,transparent:true,opacity:.53});
    window.SA201_MODEL.parts.forEach((part,i)=>{
      const conf=config[part.tag.slice(0,2)] || {id:'part'+i,label:part.name,offset:[0,0,0]};
      const group=new T.Group();group.name=part.name;model.add(group);
      part.meshes.forEach(m=>{
        const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(m.positions,3));geometry.computeVertexNormals();
        const [r,g,b,a]=m.color;const color=new T.Color(`rgb(${r},${g},${b})`);
        const material=new T.MeshStandardMaterial({color,roughness:.74,metalness:0.05,side:T.DoubleSide,transparent:a<1,opacity:a,depthWrite:a>=1,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1});
        const mesh=new T.Mesh(geometry,material);group.add(mesh);
      });
      const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(part.edges,3));
      const lines=new T.LineSegments(geo,lineMaterial);lines.renderOrder=2;group.add(lines);
      const bounds=new T.Box3().setFromObject(group);const center=bounds.getCenter(new T.Vector3());
      const label=document.createElement('span');label.className='part-label';label.textContent=conf.label;label.hidden=true;$('#part-labels').append(label);
      parts.push({...conf,group,lines,center,label});
    });
    let explode=0,desiredExplode=0,currentView='exterior',pendingFit=false;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const visible=id=>parts.find(p=>p.id===id)?.group.visible;
    function setVisible(id,value){parts.filter(p=>p.id===id || (id==='base' && p.id==='floor')).forEach(p=>p.group.visible=value);const input=document.getElementById(id);if(input)input.checked=value;}
    function updateExplosion(v){desiredExplode=Math.max(0,Math.min(1,Number(v)/100));$('#explode').value=Math.round(desiredExplode*100);$('#explode-value').textContent=`${Math.round(desiredExplode*100)}%`;$('#explode-toggle').textContent=desiredExplode>.5?'收合爆炸圖':'展開爆炸圖';}
    function boundsVisible(){const bounds=new T.Box3();parts.filter(p=>p.group.visible).forEach(p=>bounds.union(new T.Box3().setFromObject(p.group)));return bounds.isEmpty()?new T.Box3(new T.Vector3(-300,0,-4200),new T.Vector3(2600,3000,300)):bounds;}
    function fit(direction){const bounds=boundsVisible(),center=bounds.getCenter(new T.Vector3()),size=bounds.getSize(new T.Vector3());
      const dir=(direction||camera.position.clone().sub(controls.target)).normalize();
      const radius=size.length()/2;const vf=T.MathUtils.degToRad(camera.fov)/2;const hf=Math.atan(Math.tan(vf)*camera.aspect);const dist=radius/Math.sin(Math.min(vf,hf))*1.08;
      controls.target.copy(center);camera.position.copy(center).addScaledVector(dir,dist);camera.lookAt(center);controls.update();}
    function setView(mode){currentView=mode;document.querySelectorAll('[data-view]').forEach(b=>{const active=b.dataset.view===mode;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
      $('#view-name').textContent={exterior:'外觀透視',interior:'室內配置',top:'俯視檢視'}[mode];
      setVisible('roof',mode==='exterior');
      const dir={exterior:new T.Vector3(1,.72,1.25),interior:new T.Vector3(.5,1.6,.8),top:new T.Vector3(0,1,.0001)}[mode];fit(dir);}
    ['roof','base'].forEach(id=>$('#'+id).addEventListener('change',e=>setVisible(id,e.target.checked)));
    parts.filter(p=>!['roof','base','floor'].includes(p.id)).forEach(p=>{
      const label=document.createElement('label');label.className='toggle';
      const span=document.createElement('span');const b=document.createElement('b');b.textContent=p.label;span.append(b);
      const input=document.createElement('input');input.type='checkbox';input.id=p.id;input.checked=true;input.addEventListener('change',()=>setVisible(p.id,input.checked));
      const knob=document.createElement('i');knob.setAttribute('aria-hidden','true');label.append(span,input,knob);$('#part-controls').append(label);
    });
    document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
    $('#show-all').addEventListener('click',()=>{parts.forEach(p=>setVisible(p.id,true));fit();});
    $('#explode').addEventListener('input',e=>{updateExplosion(e.target.value);});
    $('#explode').addEventListener('change',()=>{pendingFit=true;});
    $('#explode-toggle').addEventListener('click',()=>{updateExplosion(desiredExplode>.5?0:100);pendingFit=true;});
    $('#assemble').addEventListener('click',()=>{updateExplosion(0);pendingFit=true;});
    $('#fit').addEventListener('click',()=>fit());
    $('#rotate').addEventListener('change',e=>controls.autoRotate=e.target.checked);
    $('#edges').addEventListener('change',e=>parts.forEach(p=>p.lines.visible=e.target.checked));
    $('#reset').addEventListener('click',()=>{parts.forEach(p=>setVisible(p.id,true));updateExplosion(0);explode=0;parts.forEach(p=>p.group.position.set(0,0,0));$('#rotate').checked=false;controls.autoRotate=false;$('#edges').checked=true;parts.forEach(p=>p.lines.visible=true);$('#labels').checked=true;setView('exterior');});
    const resize=()=>{const w=viewport.clientWidth,h=viewport.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();};
    new ResizeObserver(()=>{resize();fit();}).observe(viewport);resize();setView('exterior');$('#loading').hidden=true;
    const projected=new T.Vector3();
    function animate(){requestAnimationFrame(animate);const diff=desiredExplode-explode;
      if(Math.abs(diff)>.0005){explode=reduced?desiredExplode:explode+diff*.15;parts.forEach(p=>p.group.position.set(...p.offset.map(v=>v*explode)));}
      else if(pendingFit){pendingFit=false;fit();}
      controls.update();
      parts.forEach(p=>{const show=explode>.12 && $('#labels').checked && p.group.visible && !['floor','details'].includes(p.id);p.label.hidden=!show;if(show){projected.copy(p.center).add(p.group.position).project(camera);p.label.hidden=projected.z>1 || projected.z< -1 || Math.abs(projected.x)>1 || Math.abs(projected.y)>1;p.label.style.left=(projected.x*.5+.5)*viewport.clientWidth+'px';p.label.style.top=(-projected.y*.5+.5)*viewport.clientHeight+'px';}});
      renderer.render(scene,camera);
    }animate();
    // Read-only diagnostic summary for verifying packaged controls.
    window.SA201Viewer={getState:()=>({explode:desiredExplode,actualExplode:explode,view:currentView,parts:parts.map(p=>({id:p.id,visible:p.group.visible,position:p.group.position.toArray(),triangles:p.group.children.filter(c=>c.isMesh).reduce((n,c)=>n+c.geometry.attributes.position.count/3,0)})),autoRotate:controls.autoRotate,edges:$('#edges').checked})};
  }catch(error){console.error(error);$('#loading').hidden=true;$('#error').hidden=false;}
})();
