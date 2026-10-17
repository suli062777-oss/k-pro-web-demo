import{a as Ot}from"./viewer-chunks/chunk-ECD7TXEH.js";import{a as Ft,b as Lt}from"./viewer-chunks/chunk-LPULIUVY.js";import{a as At}from"./viewer-chunks/chunk-YXJYSYA6.js";import{$ as G,Aa as Re,Ba as Ge,Ca as wt,Da as Ct,Ea as Ve,F as Z,Fa as _e,Ha as de,Ia as J,Ja as Rt,Ka as j,M as pt,N as ae,Na as _t,P as mt,Q as $,R as B,T as M,U as gt,W as Q,X as vt,Xa as bt,Za as yt,_ as K,aa as Tt,ab as Pt,ba as xt,bb as We,c as at,ca as ue,e as st,ea as Ne,eb as Bt,fa as Mt,ga as Et,gb as Ht,ib as be,j as ze,k as Te,kb as Dt,l as ot,la as St,lb as kt,m as nt,ma as k,o as lt,p as ut,q as dt,r as Ce,s as ct,t as ht,u as ft,za as xe}from"./viewer-chunks/chunk-2DTISNQO.js";import"./viewer-chunks/chunk-W4PMOD6W.js";var ye={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};var A=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}},Zt=new Pt(-1,1,1,-1,0,1),Qe=class extends Et{constructor(){super(),this.setAttribute("position",new Ne([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new Ne([0,2,0,0,2,0],2))}},$t=new Qe,se=class{constructor(e){this._mesh=new k($t,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,Zt)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}};var Pe=class extends A{constructor(e,i="tDiffuse"){super(),this.textureID=i,this.uniforms=null,this.material=null,e instanceof J?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=de.clone(e.uniforms),this.material=new J({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new se(this.material)}render(e,i,o){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=o.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(i),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var Me=class extends A{constructor(e,i){super(),this.scene=e,this.camera=i,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,i,o){let r=e.getContext(),t=e.state;t.buffers.color.setMask(!1),t.buffers.depth.setMask(!1),t.buffers.color.setLocked(!0),t.buffers.depth.setLocked(!0);let u,s;this.inverse?(u=0,s=1):(u=1,s=0),t.buffers.stencil.setTest(!0),t.buffers.stencil.setOp(r.REPLACE,r.REPLACE,r.REPLACE),t.buffers.stencil.setFunc(r.ALWAYS,u,4294967295),t.buffers.stencil.setClear(s),t.buffers.stencil.setLocked(!0),e.setRenderTarget(o),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(i),this.clear&&e.clear(),e.render(this.scene,this.camera),t.buffers.color.setLocked(!1),t.buffers.depth.setLocked(!1),t.buffers.color.setMask(!0),t.buffers.depth.setMask(!0),t.buffers.stencil.setLocked(!1),t.buffers.stencil.setFunc(r.EQUAL,1,4294967295),t.buffers.stencil.setOp(r.KEEP,r.KEEP,r.KEEP),t.buffers.stencil.setLocked(!0)}},Be=class extends A{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}};var He=class{constructor(e,i){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),i===void 0){let o=e.getSize(new B);this._width=o.width,this._height=o.height,i=new Q(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:Z}),i.texture.name="EffectComposer.rt1"}else this._width=i.width,this._height=i.height;this.renderTarget1=i,this.renderTarget2=i.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Pe(ye),this.copyPass.material.blending=Te,this.timer=new Bt}swapBuffers(){let e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,i){this.passes.splice(i,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){let i=this.passes.indexOf(e);i!==-1&&this.passes.splice(i,1)}isLastEnabledPass(e){for(let i=e+1;i<this.passes.length;i++)if(this.passes[i].enabled)return!1;return!0}render(e){this.timer.update(),e===void 0&&(e=this.timer.getDelta());let i=this.renderer.getRenderTarget(),o=!1;for(let r=0,t=this.passes.length;r<t;r++){let u=this.passes[r];if(u.enabled!==!1){if(u.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(r),u.render(this.renderer,this.writeBuffer,this.readBuffer,e,o),u.needsSwap){if(o){let s=this.renderer.getContext(),h=this.renderer.state.buffers.stencil;h.setFunc(s.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),h.setFunc(s.EQUAL,1,4294967295)}this.swapBuffers()}Me!==void 0&&(u instanceof Me?o=!0:u instanceof Be&&(o=!1))}}this.renderer.setRenderTarget(i)}reset(e){if(e===void 0){let i=this.renderer.getSize(new B);this._pixelRatio=this.renderer.getPixelRatio(),this._width=i.width,this._height=i.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,i){this._width=e,this._height=i;let o=this._width*this._pixelRatio,r=this._height*this._pixelRatio;this.renderTarget1.setSize(o,r),this.renderTarget2.setSize(o,r);for(let t=0;t<this.passes.length;t++)this.passes[t].setSize(o,r)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}};var De=class extends A{constructor(e,i,o=null,r=null,t=null){super(),this.scene=e,this.camera=i,this.overrideMaterial=o,this.clearColor=r,this.clearAlpha=t,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new G}render(e,i,o){let r=e.autoClear;e.autoClear=!1;let t,u;this.overrideMaterial!==null&&(u=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(t=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:o),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(t),this.overrideMaterial!==null&&(this.scene.overrideMaterial=u),e.autoClear=r}};var ce=class n extends A{constructor(e,i,o,r){super(),this.renderScene=i,this.renderCamera=o,this.selectedObjects=r!==void 0?r:[],this.visibleEdgeColor=new G(1,1,1),this.hiddenEdgeColor=new G(.1,.04,.02),this.edgeGlow=0,this.usePatternTexture=!1,this.patternTexture=null,this.edgeThickness=1,this.edgeStrength=3,this.downSampleRatio=2,this.pulsePeriod=0,this._visibilityCache=new Map,this._selectionCache=new Set,this.resolution=e!==void 0?new B(e.x,e.y):new B(256,256);let t=Math.round(this.resolution.x/this.downSampleRatio),u=Math.round(this.resolution.y/this.downSampleRatio);this.renderTargetMaskBuffer=new Q(this.resolution.x,this.resolution.y),this.renderTargetMaskBuffer.texture.name="OutlinePass.mask",this.renderTargetMaskBuffer.texture.generateMipmaps=!1,this.depthMaterial=new _t,this.depthMaterial.side=ze,this.depthMaterial.depthPacking=pt,this.depthMaterial.blending=Te,this.prepareMaskMaterial=this._getPrepareMaskMaterial(),this.prepareMaskMaterial.side=ze,this.prepareMaskMaterial.fragmentShader=p(this.prepareMaskMaterial.fragmentShader,this.renderCamera),this.renderTargetDepthBuffer=new Q(this.resolution.x,this.resolution.y,{type:Z}),this.renderTargetDepthBuffer.texture.name="OutlinePass.depth",this.renderTargetDepthBuffer.texture.generateMipmaps=!1,this.renderTargetMaskDownSampleBuffer=new Q(t,u,{type:Z}),this.renderTargetMaskDownSampleBuffer.texture.name="OutlinePass.depthDownSample",this.renderTargetMaskDownSampleBuffer.texture.generateMipmaps=!1,this.renderTargetBlurBuffer1=new Q(t,u,{type:Z}),this.renderTargetBlurBuffer1.texture.name="OutlinePass.blur1",this.renderTargetBlurBuffer1.texture.generateMipmaps=!1,this.renderTargetBlurBuffer2=new Q(Math.round(t/2),Math.round(u/2),{type:Z}),this.renderTargetBlurBuffer2.texture.name="OutlinePass.blur2",this.renderTargetBlurBuffer2.texture.generateMipmaps=!1,this.edgeDetectionMaterial=this._getEdgeDetectionMaterial(),this.renderTargetEdgeBuffer1=new Q(t,u,{type:Z}),this.renderTargetEdgeBuffer1.texture.name="OutlinePass.edge1",this.renderTargetEdgeBuffer1.texture.generateMipmaps=!1,this.renderTargetEdgeBuffer2=new Q(Math.round(t/2),Math.round(u/2),{type:Z}),this.renderTargetEdgeBuffer2.texture.name="OutlinePass.edge2",this.renderTargetEdgeBuffer2.texture.generateMipmaps=!1;let s=4,h=4;this.separableBlurMaterial1=this._getSeparableBlurMaterial(s),this.separableBlurMaterial1.uniforms.texSize.value.set(t,u),this.separableBlurMaterial1.uniforms.kernelRadius.value=1,this.separableBlurMaterial2=this._getSeparableBlurMaterial(h),this.separableBlurMaterial2.uniforms.texSize.value.set(Math.round(t/2),Math.round(u/2)),this.separableBlurMaterial2.uniforms.kernelRadius.value=h,this.overlayMaterial=this._getOverlayMaterial();let T=ye;this.copyUniforms=de.clone(T.uniforms),this.materialCopy=new J({uniforms:this.copyUniforms,vertexShader:T.vertexShader,fragmentShader:T.fragmentShader,blending:Te,depthTest:!1,depthWrite:!1}),this.enabled=!0,this.needsSwap=!1,this._oldClearColor=new G,this.oldClearAlpha=1,this._fsQuad=new se(null),this.tempPulseColor1=new G,this.tempPulseColor2=new G,this.textureMatrix=new vt;function p(_,m){let d=m.isPerspectiveCamera?"perspective":"orthographic";return _.replace(/DEPTH_TO_VIEW_Z/g,d+"DepthToViewZ")}}dispose(){this.renderTargetMaskBuffer.dispose(),this.renderTargetDepthBuffer.dispose(),this.renderTargetMaskDownSampleBuffer.dispose(),this.renderTargetBlurBuffer1.dispose(),this.renderTargetBlurBuffer2.dispose(),this.renderTargetEdgeBuffer1.dispose(),this.renderTargetEdgeBuffer2.dispose(),this.depthMaterial.dispose(),this.prepareMaskMaterial.dispose(),this.edgeDetectionMaterial.dispose(),this.separableBlurMaterial1.dispose(),this.separableBlurMaterial2.dispose(),this.overlayMaterial.dispose(),this.materialCopy.dispose(),this._fsQuad.dispose()}setSize(e,i){this.renderTargetMaskBuffer.setSize(e,i),this.renderTargetDepthBuffer.setSize(e,i);let o=Math.round(e/this.downSampleRatio),r=Math.round(i/this.downSampleRatio);this.renderTargetMaskDownSampleBuffer.setSize(o,r),this.renderTargetBlurBuffer1.setSize(o,r),this.renderTargetEdgeBuffer1.setSize(o,r),this.separableBlurMaterial1.uniforms.texSize.value.set(o,r),o=Math.round(o/2),r=Math.round(r/2),this.renderTargetBlurBuffer2.setSize(o,r),this.renderTargetEdgeBuffer2.setSize(o,r),this.separableBlurMaterial2.uniforms.texSize.value.set(o,r)}render(e,i,o,r,t){if(this.selectedObjects.length>0){e.getClearColor(this._oldClearColor),this.oldClearAlpha=e.getClearAlpha();let u=e.autoClear;e.autoClear=!1,t&&e.state.buffers.stencil.setTest(!1),e.setClearColor(16777215,1),this._updateSelectionCache(),this._changeVisibilityOfSelectedObjects(!1);let s=this.renderScene.background,h=this.renderScene.overrideMaterial;if(this.renderScene.background=null,this.renderScene.overrideMaterial=this.depthMaterial,e.setRenderTarget(this.renderTargetDepthBuffer),e.clear(),e.render(this.renderScene,this.renderCamera),this._changeVisibilityOfSelectedObjects(!0),this._visibilityCache.clear(),this._updateTextureMatrix(),this._changeVisibilityOfNonSelectedObjects(!1),this.renderScene.overrideMaterial=this.prepareMaskMaterial,this.prepareMaskMaterial.uniforms.cameraNearFar.value.set(this.renderCamera.near,this.renderCamera.far),this.prepareMaskMaterial.uniforms.depthTexture.value=this.renderTargetDepthBuffer.texture,this.prepareMaskMaterial.uniforms.textureMatrix.value=this.textureMatrix,e.setRenderTarget(this.renderTargetMaskBuffer),e.clear(),e.render(this.renderScene,this.renderCamera),this._changeVisibilityOfNonSelectedObjects(!0),this._visibilityCache.clear(),this._selectionCache.clear(),this.renderScene.background=s,this.renderScene.overrideMaterial=h,this._fsQuad.material=this.materialCopy,this.copyUniforms.tDiffuse.value=this.renderTargetMaskBuffer.texture,e.setRenderTarget(this.renderTargetMaskDownSampleBuffer),e.clear(),this._fsQuad.render(e),this.tempPulseColor1.copy(this.visibleEdgeColor),this.tempPulseColor2.copy(this.hiddenEdgeColor),this.pulsePeriod>0){let T=.625+Math.cos(performance.now()*.01/this.pulsePeriod)*.75/2;this.tempPulseColor1.multiplyScalar(T),this.tempPulseColor2.multiplyScalar(T)}this._fsQuad.material=this.edgeDetectionMaterial,this.edgeDetectionMaterial.uniforms.maskTexture.value=this.renderTargetMaskDownSampleBuffer.texture,this.edgeDetectionMaterial.uniforms.texSize.value.set(this.renderTargetMaskDownSampleBuffer.width,this.renderTargetMaskDownSampleBuffer.height),this.edgeDetectionMaterial.uniforms.visibleEdgeColor.value=this.tempPulseColor1,this.edgeDetectionMaterial.uniforms.hiddenEdgeColor.value=this.tempPulseColor2,e.setRenderTarget(this.renderTargetEdgeBuffer1),e.clear(),this._fsQuad.render(e),this._fsQuad.material=this.separableBlurMaterial1,this.separableBlurMaterial1.uniforms.colorTexture.value=this.renderTargetEdgeBuffer1.texture,this.separableBlurMaterial1.uniforms.direction.value=n.BlurDirectionX,this.separableBlurMaterial1.uniforms.kernelRadius.value=this.edgeThickness,e.setRenderTarget(this.renderTargetBlurBuffer1),e.clear(),this._fsQuad.render(e),this.separableBlurMaterial1.uniforms.colorTexture.value=this.renderTargetBlurBuffer1.texture,this.separableBlurMaterial1.uniforms.direction.value=n.BlurDirectionY,e.setRenderTarget(this.renderTargetEdgeBuffer1),e.clear(),this._fsQuad.render(e),this._fsQuad.material=this.separableBlurMaterial2,this.separableBlurMaterial2.uniforms.colorTexture.value=this.renderTargetEdgeBuffer1.texture,this.separableBlurMaterial2.uniforms.direction.value=n.BlurDirectionX,e.setRenderTarget(this.renderTargetBlurBuffer2),e.clear(),this._fsQuad.render(e),this.separableBlurMaterial2.uniforms.colorTexture.value=this.renderTargetBlurBuffer2.texture,this.separableBlurMaterial2.uniforms.direction.value=n.BlurDirectionY,e.setRenderTarget(this.renderTargetEdgeBuffer2),e.clear(),this._fsQuad.render(e),this._fsQuad.material=this.overlayMaterial,this.overlayMaterial.uniforms.maskTexture.value=this.renderTargetMaskBuffer.texture,this.overlayMaterial.uniforms.edgeTexture1.value=this.renderTargetEdgeBuffer1.texture,this.overlayMaterial.uniforms.edgeTexture2.value=this.renderTargetEdgeBuffer2.texture,this.overlayMaterial.uniforms.patternTexture.value=this.patternTexture,this.overlayMaterial.uniforms.edgeStrength.value=this.edgeStrength,this.overlayMaterial.uniforms.edgeGlow.value=this.edgeGlow,this.overlayMaterial.uniforms.usePatternTexture.value=this.usePatternTexture,t&&e.state.buffers.stencil.setTest(!0),e.setRenderTarget(o),this._fsQuad.render(e),e.setClearColor(this._oldClearColor,this.oldClearAlpha),e.autoClear=u}this.renderToScreen&&(this._fsQuad.material=this.materialCopy,this.copyUniforms.tDiffuse.value=o.texture,e.setRenderTarget(null),this._fsQuad.render(e))}_updateSelectionCache(){let e=this._selectionCache;function i(o){o.isMesh&&e.add(o)}e.clear();for(let o=0;o<this.selectedObjects.length;o++)this.selectedObjects[o].traverse(i)}_changeVisibilityOfSelectedObjects(e){let i=this._visibilityCache;for(let o of this._selectionCache)e===!0?o.visible=i.get(o):(i.set(o,o.visible),o.visible=e)}_changeVisibilityOfNonSelectedObjects(e){let i=this._visibilityCache,o=this._selectionCache;function r(t){if(t.isPoints||t.isLine||t.isLine2)e===!0?t.visible=i.get(t):(i.set(t,t.visible),t.visible=e);else if((t.isMesh||t.isSprite)&&!o.has(t)){let u=t.visible;(e===!1||i.get(t)===!0)&&(t.visible=e),i.set(t,u)}}this.renderScene.traverse(r)}_updateTextureMatrix(){this.textureMatrix.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),this.textureMatrix.multiply(this.renderCamera.projectionMatrix),this.textureMatrix.multiply(this.renderCamera.matrixWorldInverse)}_getPrepareMaskMaterial(){return new J({uniforms:{depthTexture:{value:null},cameraNearFar:{value:new B(.5,.5)},textureMatrix:{value:null}},vertexShader:`#include <batching_pars_vertex>
				#include <morphtarget_pars_vertex>
				#include <skinning_pars_vertex>

				varying vec4 projTexCoord;
				varying vec4 vPosition;
				uniform mat4 textureMatrix;

				void main() {

					#include <batching_vertex>
					#include <skinbase_vertex>
					#include <begin_vertex>
					#include <morphtarget_vertex>
					#include <skinning_vertex>
					#include <project_vertex>

					vPosition = mvPosition;

					vec4 worldPosition = vec4( transformed, 1.0 );

					#ifdef USE_INSTANCING

						worldPosition = instanceMatrix * worldPosition;

					#endif

					worldPosition = modelMatrix * worldPosition;

					projTexCoord = textureMatrix * worldPosition;

				}`,fragmentShader:`#include <packing>
				varying vec4 vPosition;
				varying vec4 projTexCoord;
				uniform sampler2D depthTexture;
				uniform vec2 cameraNearFar;

				void main() {

					float depth = unpackRGBAToDepth(texture2DProj( depthTexture, projTexCoord ));
					float viewZ = - DEPTH_TO_VIEW_Z( depth, cameraNearFar.x, cameraNearFar.y );
					float depthTest = (-vPosition.z > viewZ) ? 1.0 : 0.0;
					gl_FragColor = vec4(0.0, depthTest, 1.0, 1.0);

				}`})}_getEdgeDetectionMaterial(){return new J({uniforms:{maskTexture:{value:null},texSize:{value:new B(.5,.5)},visibleEdgeColor:{value:new M(1,1,1)},hiddenEdgeColor:{value:new M(1,1,1)}},vertexShader:`varying vec2 vUv;

				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`varying vec2 vUv;

				uniform sampler2D maskTexture;
				uniform vec2 texSize;
				uniform vec3 visibleEdgeColor;
				uniform vec3 hiddenEdgeColor;

				void main() {
					vec2 invSize = 1.0 / texSize;
					vec4 uvOffset = vec4(1.0, 0.0, 0.0, 1.0) * vec4(invSize, invSize);
					vec4 c1 = texture2D( maskTexture, vUv + uvOffset.xy);
					vec4 c2 = texture2D( maskTexture, vUv - uvOffset.xy);
					vec4 c3 = texture2D( maskTexture, vUv + uvOffset.yw);
					vec4 c4 = texture2D( maskTexture, vUv - uvOffset.yw);
					float diff1 = (c1.r - c2.r)*0.5;
					float diff2 = (c3.r - c4.r)*0.5;
					float d = length( vec2(diff1, diff2) );
					float a1 = min(c1.g, c2.g);
					float a2 = min(c3.g, c4.g);
					float visibilityFactor = min(a1, a2);
					vec3 edgeColor = 1.0 - visibilityFactor > 0.001 ? visibleEdgeColor : hiddenEdgeColor;
					gl_FragColor = vec4(edgeColor, 1.0) * vec4(d);
				}`})}_getSeparableBlurMaterial(e){return new J({defines:{MAX_RADIUS:e},uniforms:{colorTexture:{value:null},texSize:{value:new B(.5,.5)},direction:{value:new B(.5,.5)},kernelRadius:{value:1}},vertexShader:`varying vec2 vUv;

				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`#include <common>
				varying vec2 vUv;
				uniform sampler2D colorTexture;
				uniform vec2 texSize;
				uniform vec2 direction;
				uniform float kernelRadius;

				float gaussianPdf(in float x, in float sigma) {
					return 0.39894 * exp( -0.5 * x * x/( sigma * sigma))/sigma;
				}

				void main() {
					vec2 invSize = 1.0 / texSize;
					float sigma = kernelRadius/2.0;
					float weightSum = gaussianPdf(0.0, sigma);
					vec4 diffuseSum = texture2D( colorTexture, vUv) * weightSum;
					vec2 delta = direction * invSize * kernelRadius/float(MAX_RADIUS);
					vec2 uvOffset = delta;
					for( int i = 1; i <= MAX_RADIUS; i ++ ) {
						float x = kernelRadius * float(i) / float(MAX_RADIUS);
						float w = gaussianPdf(x, sigma);
						vec4 sample1 = texture2D( colorTexture, vUv + uvOffset);
						vec4 sample2 = texture2D( colorTexture, vUv - uvOffset);
						diffuseSum += ((sample1 + sample2) * w);
						weightSum += (2.0 * w);
						uvOffset += delta;
					}
					gl_FragColor = diffuseSum/weightSum;
				}`})}_getOverlayMaterial(){return new J({uniforms:{maskTexture:{value:null},edgeTexture1:{value:null},edgeTexture2:{value:null},patternTexture:{value:null},edgeStrength:{value:1},edgeGlow:{value:1},usePatternTexture:{value:0}},vertexShader:`varying vec2 vUv;

				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`varying vec2 vUv;

				uniform sampler2D maskTexture;
				uniform sampler2D edgeTexture1;
				uniform sampler2D edgeTexture2;
				uniform sampler2D patternTexture;
				uniform float edgeStrength;
				uniform float edgeGlow;
				uniform bool usePatternTexture;

				void main() {
					vec4 edgeValue1 = texture2D(edgeTexture1, vUv);
					vec4 edgeValue2 = texture2D(edgeTexture2, vUv);
					vec4 maskColor = texture2D(maskTexture, vUv);
					vec4 patternColor = texture2D(patternTexture, 6.0 * vUv);
					float visibilityFactor = 1.0 - maskColor.g > 0.0 ? 1.0 : 0.5;
					vec4 edgeValue = edgeValue1 + edgeValue2 * edgeGlow;
					vec4 finalColor = edgeStrength * maskColor.r * edgeValue;
					if(usePatternTexture)
						finalColor += + visibilityFactor * (1.0 - maskColor.r) * (1.0 - patternColor.r);
					gl_FragColor = finalColor;
				}`,blending:nt,depthTest:!1,depthWrite:!1,transparent:!0})}};ce.BlurDirectionX=new B(1,0);ce.BlurDirectionY=new B(0,1);var Ee={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#elif defined( CUSTOM_TONE_MAPPING )

				gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`};var ke=class extends A{constructor(){super(),this.isOutputPass=!0,this.uniforms=de.clone(Ee.uniforms),this.material=new Rt({name:Ee.name,uniforms:this.uniforms,vertexShader:Ee.vertexShader,fragmentShader:Ee.fragmentShader}),this._fsQuad=new se(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,i,o){this.uniforms.tDiffuse.value=o.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},gt.getTransfer(this._outputColorSpace)===mt&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===lt?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===ut?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===dt?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===Ce?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===ht?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===ft?this.material.defines.NEUTRAL_TONE_MAPPING="":this._toneMapping===ct&&(this.material.defines.CUSTOM_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(i),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var Jt=15659250;function er(){let n=document.createElement("canvas");n.width=2,n.height=512;let e=n.getContext("2d"),i=e.createLinearGradient(0,0,0,512);i.addColorStop(0,"#d9dee2"),i.addColorStop(.55,"#e6eaed"),i.addColorStop(1,"#eef0f2"),e.fillStyle=i,e.fillRect(0,0,2,512);let o=new xe(n);return ae&&(o.colorSpace=ae),o}function tr(n){let i=2048/n,o=document.createElement("canvas");o.width=o.height=2048;let r=o.getContext("2d"),t=g=>g*i,u=2048/2,s=n/2,h=2.05,T=1.5;r.fillStyle="#e9ecee",r.fillRect(0,0,2048,2048),r.strokeStyle="rgba(148,156,163,.14)",r.lineWidth=Math.max(1,t(.05)),r.beginPath();for(let g=-s+1.15;g<=s;g+=4.6)r.moveTo(u+t(g),0),r.lineTo(u+t(g),2048),r.moveTo(0,u+t(g)),r.lineTo(2048,u+t(g));r.stroke();let p=t(h),_=t(T),m=t(s+1),d=new Path2D;d.moveTo(-m,-p),d.arcTo(-p,-p,-p,-m,_),d.lineTo(-p,-m),d.lineTo(p,-m),d.arcTo(p,-p,m,-p,_),d.lineTo(m,-p),d.lineTo(m,p),d.arcTo(p,p,p,m,_),d.lineTo(p,m),d.lineTo(-p,m),d.arcTo(-p,p,-m,p,_),d.lineTo(-m,p),d.closePath(),r.save(),r.translate(u,u),r.fillStyle="#3f444a",r.fill(d),r.save(),r.clip(d);for(let g=0;g<110;g++){let x=Math.random()*Math.PI*2,U=Math.random()*50,w=t(1.5+Math.random()*4),ee=Math.cos(x)*U*i,I=Math.sin(x)*U*i,te=r.createRadialGradient(ee,I,0,ee,I,w),b=Math.random()<.5;te.addColorStop(0,b?"rgba(38,42,47,.16)":"rgba(126,132,139,.14)"),te.addColorStop(1,"rgba(0,0,0,0)"),r.fillStyle=te,r.beginPath(),r.arc(ee,I,w,0,Math.PI*2),r.fill()}for(let g=0;g<3e4;g++){let x=72+Math.random()*78|0;r.fillStyle=`rgba(${x},${x+3},${x+7},${Math.random()*.13})`,r.fillRect(Math.random()*2048-u,Math.random()*2048-u,1.5,1.5)}r.restore(),r.lineWidth=t(.17),r.strokeStyle="#d3d8dc",r.stroke(d);let f=2,S=h+.5,R=.34,C=.5,L=.42;r.fillStyle="#f5f7f8";for(let g of[-1,1]){let x=g*t(S),U=t(f);for(let w=t(-h+R);w+t(C)<=t(h-R)+.01;w+=t(C+L))r.fillRect(Math.min(x,x+g*U),w,U,t(C));for(let w=t(-h+R);w+t(C)<=t(h-R)+.01;w+=t(C+L))r.fillRect(w,Math.min(x,x+g*U),t(C),U)}r.fillStyle="#f0f3f4";for(let g of[-1,1]){let x=g*t(S+f+.5);r.fillRect(x,t(-h+R),g*t(.26),t(h*2-2*R)),r.fillRect(t(-h+R),x,t(h*2-2*R),g*t(.26))}r.restore();let H=r.createRadialGradient(u,u,2048*.3,u,u,2048*.495);H.addColorStop(0,"rgba(238,240,242,0)"),H.addColorStop(1,"rgba(238,240,242,1)"),r.fillStyle=H,r.fillRect(0,0,2048,2048);let O=new xe(o);return O.anisotropy=8,ae&&(O.colorSpace=ae),O}function Ut(n){n.background=er(),n.fog=new Tt(Jt,45,110);let e=160,i=new k(new _e(e,e),new j({map:tr(e),roughness:.96}));i.rotation.x=-Math.PI/2,i.receiveShadow=!0,n.add(i);let o=new K,r=[];function t(m,d,f,S,R,C,L){let H=new j({color:C,roughness:.88,transparent:!0,opacity:0}),O=new k(new Re(f,R,S),H);O.position.set(m,R/2,d),O.rotation.y=L??0,o.add(O),r.push(O)}let u=m=>Math.atan2(-Math.cos(m),-Math.sin(m)),s=[14080991,13357526,12765647,14541284],h=[[160,36,13,5,30,1],[190,35,14,5,28,1],[225,31,9,6,44,0],[258,34,12,5,34,2],[305,37,15,6,24,3],[60,36,13,5,28,1],[100,33,8,5,32,0]];for(let[m,d,f,S,R,C]of h){let L=m*Math.PI/180;t(Math.cos(L)*d,Math.sin(L)*d,f,S,R,C===0?3027769:s[C],u(L))}n.add(o);let T=new M;function p(m,d){n.fog.near=m*1.5,n.fog.far=m*3.4;for(let f of r){let S=T.copy(f.position).distanceTo(d);f.material.opacity=$.smoothstep(S,m*.8,m*1.15)*.85}}function _(){}return{update:_,setDistance:p}}var It=45,rr=46,ir=.45,ar=[[-1,1],[1,1],[-1,-1],[1,-1]],Ae=6.15,Gt=.23,sr=2.4,zt={home:["M4 11.4 12 4.8l8 6.6","M6.3 10.4v8.2h11.4v-8.2"],cross:["M12 5.6v12.8","M5.6 12h12.8"],face:["M8.9 13.6c.8 1.2 1.9 1.9 3.1 1.9s2.3-.7 3.1-1.9","M9.4 9.9h.01","M14.6 9.9h.01"],salon:["M8 8.3 19 16.5","M8 15.7 19 7.5"]};function Nt(n,e,i,o,r=!1){let t=n.width,u=n.height,s=n.getContext("2d");s.clearRect(0,0,t,u),s.strokeStyle="#c3cad1",s.lineWidth=3,s.beginPath(),s.moveTo(t/2,120),s.lineTo(t/2,244),s.stroke(),s.beginPath(),s.arc(t/2,256,10,0,Math.PI*2),s.fillStyle="#ffffff",s.fill(),s.strokeStyle="#aab2ba",s.stroke(),s.save(),s.shadowColor="rgba(40,50,60,.20)",s.shadowBlur=16,s.shadowOffsetY=5,s.beginPath(),s.roundRect?s.roundRect(10,10,t-20,110,55):s.rect(10,10,t-20,110),s.fillStyle="#ffffff",s.fill(),s.restore(),s.lineWidth=2,s.strokeStyle="#e6e9ec",s.stroke();let h=74,T=65,p=30;s.beginPath(),s.arc(h,T,p,0,Math.PI*2),s.fillStyle=r?"#202124":"#858585",s.fill(),s.save(),s.translate(h-15,T-15),s.scale(30/24,30/24),s.strokeStyle="#ffffff",s.lineWidth=2*(24/30),s.lineCap="round",s.lineJoin="round",o==="face"&&(s.beginPath(),s.arc(12,12,7.6,0,Math.PI*2),s.stroke()),o==="salon"&&(s.beginPath(),s.arc(6.3,6.9,2,0,Math.PI*2),s.stroke(),s.beginPath(),s.arc(6.3,17.1,2,0,Math.PI*2),s.stroke());for(let _ of zt[o]||zt.home)s.stroke(new Path2D(_));s.restore(),s.textBaseline="middle",s.textAlign="left",s.fillStyle="#23282e",s.font="700 38px 'Microsoft YaHei','PingFang SC',system-ui,sans-serif",s.fillText(e,124,i?50:65),s.fillStyle="#8d949b",s.font="400 25px 'Microsoft YaHei','PingFang SC',system-ui,sans-serif",i&&s.fillText(i,124,93),s.fillStyle="#b9bfc6",s.font="400 46px system-ui,sans-serif",s.textAlign="center",s.fillText("\u203A",r?677:668,63)}function or(n,e,i){let t=document.createElement("canvas");t.width=720,t.height=300,Nt(t,n,e,i);let u=new xe(t);ae&&(u.colorSpace=ae),u.anisotropy=8;let s=8.2,h=s*300/720,T=new k(new _e(s,h),new St({map:u,transparent:!0,depthWrite:!1,depthTest:!1,fog:!1,toneMapped:!1}));return T.renderOrder=10,T.userData.dotOffset=(.5-256/300)*h,T.userData.redraw=(p,_,m=!1)=>{Nt(t,p,_,i,m),u.needsUpdate=!0},T}function nr(n,e,i){let o=new wt,r=-n/2,t=-e/2;return o.moveTo(r+i,t),o.lineTo(r+n-i,t),o.quadraticCurveTo(r+n,t,r+n,t+i),o.lineTo(r+n,t+e-i),o.quadraticCurveTo(r+n,t+e,r+n-i,t+e),o.lineTo(r+i,t+e),o.quadraticCurveTo(r,t+e,r,t+e-i),o.lineTo(r,t+i),o.quadraticCurveTo(r,t,r+i,t),o}var he={slab:new j({color:15330800,roughness:.9}),bark:new j({color:6514797,roughness:.95}),leafA:new j({color:5465663,roughness:1}),leafB:new j({color:4676150,roughness:1}),hedge:new j({color:4677434,roughness:1}),planter:new j({color:14014940,roughness:.92})},Xe=null;function je(){let n=new K;if(Xe){let t=Xe.clone(!0);return t.rotation.y=Math.random()*Math.PI*2,t.scale.multiplyScalar(.85+Math.random()*.3),n.add(t),n}let e=new k(new Ge(.1,.15,1.15,7),he.bark);e.position.y=.58;let i=new k(new Ve(.8,1),he.leafA);i.position.y=1.62,i.scale.set(1,.82,1);let o=new k(new Ve(.52,1),he.leafB);o.position.y=2.18,o.scale.set(1,.8,1);let r=new k(new Ge(.55,.55,.12,12),he.planter);r.position.y=.06;for(let t of[e,i,o])t.castShadow=!0,t.receiveShadow=!0;return r.receiveShadow=!0,n.add(e,i,o,r),n}function lr(n){let e=n.clone(!0);e.traverse(u=>{u.isMesh&&u.material&&(u.material=u.material.clone(),u.material.color=new G(7309916))});let i=new ue().setFromObject(e),o=i.getSize(new M),r=sr/o.y;e.scale.setScalar(r),e.position.y=-i.min.y*r;let t=new K;return t.add(e),t}function ur(n){let e=new K,i=2.72,o=[5.9,9.1,12.3];for(let r of[-1,1])for(let t of[-1,1]){for(let s of o){let h=je();h.position.set(r*i,0,t*s);let T=je();T.position.set(t*s,0,r*i);for(let p of[h,T])p.rotation.y=Math.random()*Math.PI*2,p.scale.setScalar(.85+Math.random()*.3),e.add(p)}let u=je();u.position.set(r*i,0,t*i),u.rotation.y=Math.random()*Math.PI*2,e.add(u)}n.add(e)}function dr(n){let e=new Re(1,1,1),i=Ae*2-2.4,o=Ae-.5;for(let[r,t,u,s]of[[0,o,i,.34],[0,-o,i,.34],[o,0,.34,i],[-o,0,.34,i]]){let h=new k(e,he.hedge);h.scale.set(u,.4,s),h.position.set(r,Gt+.2,t),h.castShadow=!0,h.receiveShadow=!0,n.add(h)}}async function jr(n,e,i){let{onEnter:o,onFailure:r,onMotion:t,labels:u}=i,s=new kt({canvas:n,antialias:!0,alpha:!1,powerPreference:"low-power"});s.setPixelRatio(Math.min(devicePixelRatio||1,e.maxDpr??1.5)),s.shadowMap.enabled=!0,s.shadowMap.type=st,s.shadowMap.autoUpdate=!1,s.toneMapping=Ce,s.toneMappingExposure=1.08;let h=new xt,T=Ut(h),p=new At,_=new Dt(s),m=_.fromScene(p,.04);h.environment=m.texture,h.environmentIntensity=.46,p.dispose(),_.dispose();let d=new yt(30,1,.1,600),f=new Ot(d,n);f.enabled=!1,Object.assign(f,{enableDamping:!0,dampingFactor:.07,enablePan:!1,rotateSpeed:.55,zoomSpeed:.8,minPolarAngle:Math.PI*.14,maxPolarAngle:Math.PI*.49,autoRotateSpeed:e.autoSpin??ir}),f.enableZoom=!0,n.addEventListener("wheel",a=>{a.ctrlKey||a.stopImmediatePropagation()},{capture:!0,passive:!0}),f.touches={ONE:null,TWO:at.DOLLY_ROTATE},n.style.touchAction="pan-y",h.add(new bt(16777215,13620440,.78));let S=new We(16777215,2.9);S.castShadow=!0,S.shadow.mapSize.set(e.shadowSize??2048,e.shadowSize??2048);let R=new We(15659765,.7);h.add(S,S.target,R);let C=new Lt;C.setDecoderPath(new URL("./draco/",import.meta.url).href),C.setWorkerLimit(1);let L=new Ft().setDRACOLoader(C),H=!1,O=!1,g=!1,x=0,U=!1,w=0,ee=!0,I=matchMedia("(prefers-reduced-motion: reduce)").matches,te=e.language||"en",b=[],Oe=null,Fe=null,z=null,Le=matchMedia("(prefers-reduced-motion: reduce)"),fe={scale:1.04,durationMs:200,outlineWidth:2,...e.hover},X,F;function Vt(){X||(X=new He(s),X.addPass(new De(h,d)),F=new ce(new B(n.clientWidth,n.clientHeight),h,d),F.visibleEdgeColor.set(fe.outlineColor||"#fff"),F.hiddenEdgeColor.set("#000"),F.edgeThickness=fe.outlineWidth,F.downSampleRatio=2,F.pulsePeriod=0,F.overlayMaterial.blending=ot,F.overlayMaterial.uniforms.rimColor={value:new G(fe.shadowColor||"#303030")},F.overlayMaterial.fragmentShader=`
      varying vec2 vUv;
      uniform sampler2D edgeTexture1;
      uniform sampler2D edgeTexture2;
      uniform float edgeStrength;
      uniform vec3 rimColor;
      void main() {
        float edge = texture2D(edgeTexture1, vUv).r;
        float wide = texture2D(edgeTexture2, vUv).r;
        float line = smoothstep(0.025, 0.19, edge);
        float shadow = clamp(wide * 7.0, 0.0, 0.6);
        gl_FragColor = vec4(mix(rimColor, vec3(1.0), line), max(line, shadow) * edgeStrength);
      }`,X.addPass(F),X.addPass(new ke),X.setSize(n.clientWidth,n.clientHeight))}function pe(a,l="pointer"){l==="focus"?Fe=a:Oe=a;let c=Oe||Fe;if(z!==c){z=c,z&&Vt();for(let v of b){let E=v.spec.id===z;v.button.classList.toggle("is-highlighted",E),v.callout.userData.redraw(Ue(v.spec)[0],E?te==="en"?"Enter 360\xB0":"\u8FDB\u5165 360\xB0 \u7A7A\u95F4":"",E)}n.dataset.hovered=z||"",Y()}}function Wt(a){let l=!1;for(let c of b){let v=c.spec.id===z?1:0,E=Le.matches?1:a*1e3/fe.durationMs,q=c.hoverAmount;c.hoverAmount=v>q?Math.min(v,q+E):Math.max(v,q-E),l||=c.hoverAmount!==v;let y=c.hoverAmount*c.hoverAmount*(3-2*c.hoverAmount);c.visual.scale.setScalar(1+(Le.matches?0:fe.scale-1)*y),c.callout.scale.setScalar(1+(Le.matches?0:.025)*y),c.callout.position.y=c.calloutY+c.height*(c.visual.scale.x-1)*c.unit.scale.x,c.button.dataset.hoverScale=c.visual.scale.x.toFixed(4),q!==c.hoverAmount&&(ee=!0,s.shadowMap.needsUpdate=!0)}return l}function Ye(a){g||(g=!0,H=!1,f.enabled=!1,cancelAnimationFrame(x),x=0,r(a))}n.addEventListener("webglcontextlost",a=>{a.preventDefault(),Ye(new Error("World context lost"))});let qe=setTimeout(()=>Ye(new Error("World assets timed out")),3e4),Ze,$e;try{[Ze,$e]=await Promise.all([Promise.all(e.scenes.map(a=>L.loadAsync(new URL(a.model,document.baseURI).href))),L.loadAsync(new URL(e.tree,document.baseURI).href)])}catch(a){throw clearTimeout(qe),s.dispose(),C.dispose(),a}if(clearTimeout(qe),g)throw s.dispose(),C.dispose(),new Error("World load cancelled");Xe=lr($e.scene);let Ue=a=>te==="zh"?[a.name,a.desc]:[a.nameEn,a.descEn];b=e.scenes.map((a,l)=>{let c=Ze[l].scene;c.traverse(P=>{P.isMesh&&(P.castShadow=!0,P.receiveShadow=!0)}),c.rotation.y=$.degToRad(It-180+(a.yaw??180));let v=new ue().setFromObject(c),E=v.getSize(new M),q=v.getCenter(new M),y=(a.footprint||11.2)/Math.max(E.x,E.z),D=new K,ie=new K,ne=new K;c.scale.setScalar(y),c.position.set(-q.x*y,-v.min.y*y,-q.z*y),ne.position.y=Gt+.015,ne.add(c),ie.add(ne);let ve=new k(new Ct(nr(Ae*2,Ae*2,1),{depth:.2,bevelEnabled:!0,bevelThickness:.025,bevelSize:.03,bevelSegments:2,curveSegments:10}),he.slab);ve.rotation.x=-Math.PI/2,ve.receiveShadow=!0,ie.add(ve),dr(ie),D.add(ie);let W=or(Ue(a)[0],"",a.icon);return W.position.y=E.y*y+.35-W.userData.dotOffset,D.add(W),h.add(D),{wrap:D,unit:ie,visual:ne,model:c,callout:W,spec:a,index:l,height:E.y*y,calloutY:W.position.y,hoverAmount:0,button:u.get(a.id)}}),ur(h);let oe={position:new M,target:new M},Se=null;function Qt(a=!1){let l=oe.position.distanceTo(oe.target),c=d.position.clone().sub(f.target);Se=d.aspect<.9;let E=Se?16.2:18.7,q=Se?.8:1;for(let le of b){let[we,qt]=ar[le.index];le.wrap.position.set(we*E/2,0,qt*E/2),le.unit.scale.setScalar(q)}h.updateMatrixWorld(!0);let y=new ue;for(let le of b){y.union(new ue().setFromObject(le.unit));let we=le.callout.getWorldPosition(new M);y.expandByPoint(we.clone().add(new M(4.1,1.71,4.1))),y.expandByPoint(we.clone().sub(new M(4.1,1.71,4.1)))}let D=y.getCenter(new M),ie=y.getBoundingSphere(new Mt),ne=$.degToRad(d.fov),ve=2*Math.atan(Math.tan(ne/2)*d.aspect),W=ie.radius/Math.sin(Math.min(ne,ve)/2)*(Se?.98:.94);oe.target.copy(D),oe.position.copy(D).add(new M().setFromSpherical(new be(W,$.degToRad(rr),$.degToRad(It)))),a||l===0?(d.position.copy(oe.position),f.target.copy(D)):(d.position.copy(D).add(c.multiplyScalar(W/l)),f.target.copy(D)),f.minDistance=W*.4,f.maxDistance=W*1.6;let P=ie.radius;Object.assign(S.shadow.camera,{left:-P,right:P,top:P,bottom:-P,near:.1,far:P*8}),S.shadow.bias=-4e-4,S.position.copy(D).add(new M(P*.9,P*1.4,P*.6)),S.target.position.copy(D),S.shadow.camera.updateProjectionMatrix(),R.position.copy(D).add(new M(-P,P*1.2,-P)),s.shadowMap.needsUpdate=!0}let me=new M;function Ke(a,l){return me.copy(a),l.localToWorld(me),me.project(d),{x:(me.x*.5+.5)*n.clientWidth,y:(-me.y*.5+.5)*n.clientHeight}}function jt(){h.updateMatrixWorld(!0),d.updateMatrixWorld(!0);for(let a of b){let l=Ke(new M(-4,1.59446,0),a.callout),c=Ke(new M(4,3.4167*(.5-120/300),0),a.callout);Object.assign(a.button.style,{left:l.x+"px",top:l.y+"px",width:Math.max(1,c.x-l.x)+"px",height:Math.max(1,c.y-l.y)+"px"});let v=new ue().setFromObject(a.model).getCenter(new M).project(d);a.button.dataset.buildingX=((v.x*.5+.5)*n.clientWidth).toFixed(1),a.button.dataset.buildingY=((-v.y*.5+.5)*n.clientHeight).toFixed(1)}}function Je(){for(let l of b)l.callout.quaternion.copy(d.quaternion);T.setDistance(d.position.distanceTo(f.target),d.position),T.update();let a=b.filter(l=>l.hoverAmount>0);X&&a.length?(F.selectedObjects=a.map(l=>l.visual),F.edgeStrength=Math.max(...a.map(l=>l.hoverAmount)),X.render()):s.render(h,d),n.dataset.outlined=a.map(l=>l.spec.id).join(","),jt(),Object.assign(n.dataset,{frames:String(Number(n.dataset.frames||0)+1),angle:f.getAzimuthalAngle().toFixed(5),distance:d.position.distanceTo(f.target).toFixed(5),paused:String(I)}),ee=!1}function Ie(a){if(x=0,!H||g||!O){w=0;return}let l=w?(a-w)/1e3:0;if(w&&l<1/(e.maxFps||30)){x=requestAnimationFrame(Ie);return}w=a,U=!0,f.autoRotate=!I&&!z;let c=Wt(l||1/60),v=f.update(Math.min(l,.1));(v||ee||f.autoRotate)&&Je(),U=!1,f.autoRotate||v||c?x=requestAnimationFrame(Ie):w=0}function Y(){ee=!0,!x&&H&&O&&!U&&!g&&(x=requestAnimationFrame(Ie))}function Xt(a){H=!!a&&!g,f.enabled=H,H?Y():(Oe=null,Fe=null,z=null,b.forEach(l=>l.button.classList.remove("is-highlighted")),n.dataset.hovered="",cancelAnimationFrame(x),x=0,w=0),n.dataset.active=String(H)}function ge(a){I=a,f.autoRotate=!I&&!z,t(I),Y()}f.addEventListener("start",()=>{ge(!0)}),f.addEventListener("change",Y);function et(){let a=Math.max(1,n.clientWidth),l=Math.max(1,n.clientHeight);s.setSize(a,l,!1),d.aspect=a/l,d.updateProjectionMatrix(),Qt(),X?.setSize(a,l),Y()}function tt(a){if(a==="pause"){ge(!I);return}if(ge(!0),a==="reset"){f.enableDamping=!1,f.update(0),d.position.copy(oe.position),f.target.copy(oe.target),f.update(0),f.enableDamping=!0,Y();return}let l=d.position.clone().sub(f.target),c=new be().setFromVector3(l);(a==="in"||a==="out")&&(c.radius=$.clamp(c.radius*(a==="in"?.85:1/.85),f.minDistance,f.maxDistance)),a==="left"&&(c.theta-=.12),a==="right"&&(c.theta+=.12),a==="up"&&(c.phi-=.08),a==="down"&&(c.phi+=.08),c.phi=$.clamp(c.phi,f.minPolarAngle,f.maxPolarAngle),d.position.copy(f.target).add(new M().setFromSpherical(c)),f.update(0),Y()}let rt=new Ht;function it(a){let l=n.getBoundingClientRect();rt.setFromCamera(new B((a.clientX-l.left)/l.width*2-1,-((a.clientY-l.top)/l.height)*2+1),d);let c=rt.intersectObjects(b.map(E=>E.model),!0)[0];if(!c)return null;let v=c.object;for(;v.parent&&!b.some(E=>E.wrap===v);)v=v.parent;return b.find(E=>E.wrap===v)}let V=null,re=new Set;n.addEventListener("pointerdown",a=>{re.add(a.pointerId),re.size===1?V={x:a.clientX,y:a.clientY,moved:!1}:V&&(V.moved=!0),a.pointerType!=="touch"&&n.focus({preventScroll:!0})}),n.addEventListener("pointermove",a=>{if(V&&re.size&&Math.hypot(a.clientX-V.x,a.clientY-V.y)>7&&(V.moved=!0,pe(null)),a.pointerType==="mouse"&&!re.size){let l=it(a);n.style.cursor=l?"pointer":"grab",pe(l?.spec.id||null)}}),n.addEventListener("pointerleave",()=>pe(null)),n.addEventListener("pointerup",a=>{re.delete(a.pointerId)}),n.addEventListener("pointercancel",a=>{re.delete(a.pointerId),V&&(V.moved=!0)}),n.addEventListener("click",a=>{if(!H||V?.moved)return;let l=it(a);l&&(pe(null),n.focus({preventScroll:!0}),n.dataset.lastPick=l.spec.id,o(l.spec.id))}),n.addEventListener("keydown",a=>{let l={ArrowLeft:"left",ArrowRight:"right",ArrowUp:"up",ArrowDown:"down","+":"in","=":"in","-":"out"," ":"pause",Escape:"reset",Home:"reset"}[a.key];l&&(a.preventDefault(),tt(l))});let N=null;n.addEventListener("pointerdown",a=>{a.pointerType==="touch"&&re.size===1&&(N={id:a.pointerId,x:a.clientX,y:a.clientY,last:a.clientX,horizontal:!1})}),n.addEventListener("pointermove",a=>{if(!N||a.pointerId!==N.id||re.size!==1)return;let l=a.clientX-N.x,c=a.clientY-N.y;if(!N.horizontal&&Math.abs(l)>10&&Math.abs(l)>Math.abs(c)*1.2&&(N.horizontal=!0,ge(!0)),!N.horizontal)return;let v=d.position.clone().sub(f.target),E=new be().setFromVector3(v);E.theta-=(a.clientX-N.last)*.006,N.last=a.clientX,d.position.copy(f.target).add(new M().setFromSpherical(E)),f.update(0),Y()}),["pointerup","pointercancel"].forEach(a=>n.addEventListener(a,()=>{N=null}));function Yt(a){te=a;for(let l of b)l.callout.userData.redraw(Ue(l.spec)[0],l.spec.id===z?te==="en"?"Enter 360\xB0":"\u8FDB\u5165 360\xB0 \u7A7A\u95F4":"",l.spec.id===z);Y()}return O=!0,et(),f.autoRotate=!1,f.update(0),Je(),t(I),{setActive:Xt,resize:et,action:tt,setLanguage:Yt,setPaused:ge,setHighlight:pe}}export{jr as createWorldRenderer};
