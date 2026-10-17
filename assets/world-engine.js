import{a as Ot}from"./viewer-chunks/chunk-ECD7TXEH.js";import{a as Ft,b as Lt}from"./viewer-chunks/chunk-LPULIUVY.js";import{a as At}from"./viewer-chunks/chunk-YXJYSYA6.js";import{$ as G,Aa as Re,Ba as ze,Ca as wt,Da as Ct,Ea as Ne,F as Z,Fa as be,Ha as ce,Ia as J,Ja as Rt,Ka as X,M as pt,N as ae,Na as bt,P as mt,Q as $,R as P,T as E,U as gt,W as j,X as vt,Xa as yt,Za as _t,_ as K,aa as Tt,ab as Pt,ba as xt,bb as Ge,c as at,ca as de,e as st,ea as Ie,eb as Bt,fa as Mt,ga as Et,gb as Ht,ib as ye,j as Ue,k as Te,kb as Dt,l as ot,la as St,lb as kt,m as nt,ma as k,o as lt,p as ut,q as dt,r as Ce,s as ct,t as ft,u as ht,za as xe}from"./viewer-chunks/chunk-2DTISNQO.js";import"./viewer-chunks/chunk-W4PMOD6W.js";var _e={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

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


		}`};var A=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}},Zt=new Pt(-1,1,1,-1,0,1),Ve=class extends Et{constructor(){super(),this.setAttribute("position",new Ie([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new Ie([0,2,0,0,2,0],2))}},$t=new Ve,se=class{constructor(e){this._mesh=new k($t,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,Zt)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}};var Pe=class extends A{constructor(e,i="tDiffuse"){super(),this.textureID=i,this.uniforms=null,this.material=null,e instanceof J?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=ce.clone(e.uniforms),this.material=new J({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new se(this.material)}render(e,i,o){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=o.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(i),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var Me=class extends A{constructor(e,i){super(),this.scene=e,this.camera=i,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,i,o){let r=e.getContext(),t=e.state;t.buffers.color.setMask(!1),t.buffers.depth.setMask(!1),t.buffers.color.setLocked(!0),t.buffers.depth.setLocked(!0);let l,s;this.inverse?(l=0,s=1):(l=1,s=0),t.buffers.stencil.setTest(!0),t.buffers.stencil.setOp(r.REPLACE,r.REPLACE,r.REPLACE),t.buffers.stencil.setFunc(r.ALWAYS,l,4294967295),t.buffers.stencil.setClear(s),t.buffers.stencil.setLocked(!0),e.setRenderTarget(o),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(i),this.clear&&e.clear(),e.render(this.scene,this.camera),t.buffers.color.setLocked(!1),t.buffers.depth.setLocked(!1),t.buffers.color.setMask(!0),t.buffers.depth.setMask(!0),t.buffers.stencil.setLocked(!1),t.buffers.stencil.setFunc(r.EQUAL,1,4294967295),t.buffers.stencil.setOp(r.KEEP,r.KEEP,r.KEEP),t.buffers.stencil.setLocked(!0)}},Be=class extends A{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}};var He=class{constructor(e,i){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),i===void 0){let o=e.getSize(new P);this._width=o.width,this._height=o.height,i=new j(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:Z}),i.texture.name="EffectComposer.rt1"}else this._width=i.width,this._height=i.height;this.renderTarget1=i,this.renderTarget2=i.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Pe(_e),this.copyPass.material.blending=Te,this.timer=new Bt}swapBuffers(){let e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,i){this.passes.splice(i,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){let i=this.passes.indexOf(e);i!==-1&&this.passes.splice(i,1)}isLastEnabledPass(e){for(let i=e+1;i<this.passes.length;i++)if(this.passes[i].enabled)return!1;return!0}render(e){this.timer.update(),e===void 0&&(e=this.timer.getDelta());let i=this.renderer.getRenderTarget(),o=!1;for(let r=0,t=this.passes.length;r<t;r++){let l=this.passes[r];if(l.enabled!==!1){if(l.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(r),l.render(this.renderer,this.writeBuffer,this.readBuffer,e,o),l.needsSwap){if(o){let s=this.renderer.getContext(),h=this.renderer.state.buffers.stencil;h.setFunc(s.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),h.setFunc(s.EQUAL,1,4294967295)}this.swapBuffers()}Me!==void 0&&(l instanceof Me?o=!0:l instanceof Be&&(o=!1))}}this.renderer.setRenderTarget(i)}reset(e){if(e===void 0){let i=this.renderer.getSize(new P);this._pixelRatio=this.renderer.getPixelRatio(),this._width=i.width,this._height=i.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,i){this._width=e,this._height=i;let o=this._width*this._pixelRatio,r=this._height*this._pixelRatio;this.renderTarget1.setSize(o,r),this.renderTarget2.setSize(o,r);for(let t=0;t<this.passes.length;t++)this.passes[t].setSize(o,r)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}};var De=class extends A{constructor(e,i,o=null,r=null,t=null){super(),this.scene=e,this.camera=i,this.overrideMaterial=o,this.clearColor=r,this.clearAlpha=t,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new G}render(e,i,o){let r=e.autoClear;e.autoClear=!1;let t,l;this.overrideMaterial!==null&&(l=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(t=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:o),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(t),this.overrideMaterial!==null&&(this.scene.overrideMaterial=l),e.autoClear=r}};var fe=class n extends A{constructor(e,i,o,r){super(),this.renderScene=i,this.renderCamera=o,this.selectedObjects=r!==void 0?r:[],this.visibleEdgeColor=new G(1,1,1),this.hiddenEdgeColor=new G(.1,.04,.02),this.edgeGlow=0,this.usePatternTexture=!1,this.patternTexture=null,this.edgeThickness=1,this.edgeStrength=3,this.downSampleRatio=2,this.pulsePeriod=0,this._visibilityCache=new Map,this._selectionCache=new Set,this.resolution=e!==void 0?new P(e.x,e.y):new P(256,256);let t=Math.round(this.resolution.x/this.downSampleRatio),l=Math.round(this.resolution.y/this.downSampleRatio);this.renderTargetMaskBuffer=new j(this.resolution.x,this.resolution.y),this.renderTargetMaskBuffer.texture.name="OutlinePass.mask",this.renderTargetMaskBuffer.texture.generateMipmaps=!1,this.depthMaterial=new bt,this.depthMaterial.side=Ue,this.depthMaterial.depthPacking=pt,this.depthMaterial.blending=Te,this.prepareMaskMaterial=this._getPrepareMaskMaterial(),this.prepareMaskMaterial.side=Ue,this.prepareMaskMaterial.fragmentShader=p(this.prepareMaskMaterial.fragmentShader,this.renderCamera),this.renderTargetDepthBuffer=new j(this.resolution.x,this.resolution.y,{type:Z}),this.renderTargetDepthBuffer.texture.name="OutlinePass.depth",this.renderTargetDepthBuffer.texture.generateMipmaps=!1,this.renderTargetMaskDownSampleBuffer=new j(t,l,{type:Z}),this.renderTargetMaskDownSampleBuffer.texture.name="OutlinePass.depthDownSample",this.renderTargetMaskDownSampleBuffer.texture.generateMipmaps=!1,this.renderTargetBlurBuffer1=new j(t,l,{type:Z}),this.renderTargetBlurBuffer1.texture.name="OutlinePass.blur1",this.renderTargetBlurBuffer1.texture.generateMipmaps=!1,this.renderTargetBlurBuffer2=new j(Math.round(t/2),Math.round(l/2),{type:Z}),this.renderTargetBlurBuffer2.texture.name="OutlinePass.blur2",this.renderTargetBlurBuffer2.texture.generateMipmaps=!1,this.edgeDetectionMaterial=this._getEdgeDetectionMaterial(),this.renderTargetEdgeBuffer1=new j(t,l,{type:Z}),this.renderTargetEdgeBuffer1.texture.name="OutlinePass.edge1",this.renderTargetEdgeBuffer1.texture.generateMipmaps=!1,this.renderTargetEdgeBuffer2=new j(Math.round(t/2),Math.round(l/2),{type:Z}),this.renderTargetEdgeBuffer2.texture.name="OutlinePass.edge2",this.renderTargetEdgeBuffer2.texture.generateMipmaps=!1;let s=4,h=4;this.separableBlurMaterial1=this._getSeparableBlurMaterial(s),this.separableBlurMaterial1.uniforms.texSize.value.set(t,l),this.separableBlurMaterial1.uniforms.kernelRadius.value=1,this.separableBlurMaterial2=this._getSeparableBlurMaterial(h),this.separableBlurMaterial2.uniforms.texSize.value.set(Math.round(t/2),Math.round(l/2)),this.separableBlurMaterial2.uniforms.kernelRadius.value=h,this.overlayMaterial=this._getOverlayMaterial();let x=_e;this.copyUniforms=ce.clone(x.uniforms),this.materialCopy=new J({uniforms:this.copyUniforms,vertexShader:x.vertexShader,fragmentShader:x.fragmentShader,blending:Te,depthTest:!1,depthWrite:!1}),this.enabled=!0,this.needsSwap=!1,this._oldClearColor=new G,this.oldClearAlpha=1,this._fsQuad=new se(null),this.tempPulseColor1=new G,this.tempPulseColor2=new G,this.textureMatrix=new vt;function p(b,m){let c=m.isPerspectiveCamera?"perspective":"orthographic";return b.replace(/DEPTH_TO_VIEW_Z/g,c+"DepthToViewZ")}}dispose(){this.renderTargetMaskBuffer.dispose(),this.renderTargetDepthBuffer.dispose(),this.renderTargetMaskDownSampleBuffer.dispose(),this.renderTargetBlurBuffer1.dispose(),this.renderTargetBlurBuffer2.dispose(),this.renderTargetEdgeBuffer1.dispose(),this.renderTargetEdgeBuffer2.dispose(),this.depthMaterial.dispose(),this.prepareMaskMaterial.dispose(),this.edgeDetectionMaterial.dispose(),this.separableBlurMaterial1.dispose(),this.separableBlurMaterial2.dispose(),this.overlayMaterial.dispose(),this.materialCopy.dispose(),this._fsQuad.dispose()}setSize(e,i){this.renderTargetMaskBuffer.setSize(e,i),this.renderTargetDepthBuffer.setSize(e,i);let o=Math.round(e/this.downSampleRatio),r=Math.round(i/this.downSampleRatio);this.renderTargetMaskDownSampleBuffer.setSize(o,r),this.renderTargetBlurBuffer1.setSize(o,r),this.renderTargetEdgeBuffer1.setSize(o,r),this.separableBlurMaterial1.uniforms.texSize.value.set(o,r),o=Math.round(o/2),r=Math.round(r/2),this.renderTargetBlurBuffer2.setSize(o,r),this.renderTargetEdgeBuffer2.setSize(o,r),this.separableBlurMaterial2.uniforms.texSize.value.set(o,r)}render(e,i,o,r,t){if(this.selectedObjects.length>0){e.getClearColor(this._oldClearColor),this.oldClearAlpha=e.getClearAlpha();let l=e.autoClear;e.autoClear=!1,t&&e.state.buffers.stencil.setTest(!1),e.setClearColor(16777215,1),this._updateSelectionCache(),this._changeVisibilityOfSelectedObjects(!1);let s=this.renderScene.background,h=this.renderScene.overrideMaterial;if(this.renderScene.background=null,this.renderScene.overrideMaterial=this.depthMaterial,e.setRenderTarget(this.renderTargetDepthBuffer),e.clear(),e.render(this.renderScene,this.renderCamera),this._changeVisibilityOfSelectedObjects(!0),this._visibilityCache.clear(),this._updateTextureMatrix(),this._changeVisibilityOfNonSelectedObjects(!1),this.renderScene.overrideMaterial=this.prepareMaskMaterial,this.prepareMaskMaterial.uniforms.cameraNearFar.value.set(this.renderCamera.near,this.renderCamera.far),this.prepareMaskMaterial.uniforms.depthTexture.value=this.renderTargetDepthBuffer.texture,this.prepareMaskMaterial.uniforms.textureMatrix.value=this.textureMatrix,e.setRenderTarget(this.renderTargetMaskBuffer),e.clear(),e.render(this.renderScene,this.renderCamera),this._changeVisibilityOfNonSelectedObjects(!0),this._visibilityCache.clear(),this._selectionCache.clear(),this.renderScene.background=s,this.renderScene.overrideMaterial=h,this._fsQuad.material=this.materialCopy,this.copyUniforms.tDiffuse.value=this.renderTargetMaskBuffer.texture,e.setRenderTarget(this.renderTargetMaskDownSampleBuffer),e.clear(),this._fsQuad.render(e),this.tempPulseColor1.copy(this.visibleEdgeColor),this.tempPulseColor2.copy(this.hiddenEdgeColor),this.pulsePeriod>0){let x=.625+Math.cos(performance.now()*.01/this.pulsePeriod)*.75/2;this.tempPulseColor1.multiplyScalar(x),this.tempPulseColor2.multiplyScalar(x)}this._fsQuad.material=this.edgeDetectionMaterial,this.edgeDetectionMaterial.uniforms.maskTexture.value=this.renderTargetMaskDownSampleBuffer.texture,this.edgeDetectionMaterial.uniforms.texSize.value.set(this.renderTargetMaskDownSampleBuffer.width,this.renderTargetMaskDownSampleBuffer.height),this.edgeDetectionMaterial.uniforms.visibleEdgeColor.value=this.tempPulseColor1,this.edgeDetectionMaterial.uniforms.hiddenEdgeColor.value=this.tempPulseColor2,e.setRenderTarget(this.renderTargetEdgeBuffer1),e.clear(),this._fsQuad.render(e),this._fsQuad.material=this.separableBlurMaterial1,this.separableBlurMaterial1.uniforms.colorTexture.value=this.renderTargetEdgeBuffer1.texture,this.separableBlurMaterial1.uniforms.direction.value=n.BlurDirectionX,this.separableBlurMaterial1.uniforms.kernelRadius.value=this.edgeThickness,e.setRenderTarget(this.renderTargetBlurBuffer1),e.clear(),this._fsQuad.render(e),this.separableBlurMaterial1.uniforms.colorTexture.value=this.renderTargetBlurBuffer1.texture,this.separableBlurMaterial1.uniforms.direction.value=n.BlurDirectionY,e.setRenderTarget(this.renderTargetEdgeBuffer1),e.clear(),this._fsQuad.render(e),this._fsQuad.material=this.separableBlurMaterial2,this.separableBlurMaterial2.uniforms.colorTexture.value=this.renderTargetEdgeBuffer1.texture,this.separableBlurMaterial2.uniforms.direction.value=n.BlurDirectionX,e.setRenderTarget(this.renderTargetBlurBuffer2),e.clear(),this._fsQuad.render(e),this.separableBlurMaterial2.uniforms.colorTexture.value=this.renderTargetBlurBuffer2.texture,this.separableBlurMaterial2.uniforms.direction.value=n.BlurDirectionY,e.setRenderTarget(this.renderTargetEdgeBuffer2),e.clear(),this._fsQuad.render(e),this._fsQuad.material=this.overlayMaterial,this.overlayMaterial.uniforms.maskTexture.value=this.renderTargetMaskBuffer.texture,this.overlayMaterial.uniforms.edgeTexture1.value=this.renderTargetEdgeBuffer1.texture,this.overlayMaterial.uniforms.edgeTexture2.value=this.renderTargetEdgeBuffer2.texture,this.overlayMaterial.uniforms.patternTexture.value=this.patternTexture,this.overlayMaterial.uniforms.edgeStrength.value=this.edgeStrength,this.overlayMaterial.uniforms.edgeGlow.value=this.edgeGlow,this.overlayMaterial.uniforms.usePatternTexture.value=this.usePatternTexture,t&&e.state.buffers.stencil.setTest(!0),e.setRenderTarget(o),this._fsQuad.render(e),e.setClearColor(this._oldClearColor,this.oldClearAlpha),e.autoClear=l}this.renderToScreen&&(this._fsQuad.material=this.materialCopy,this.copyUniforms.tDiffuse.value=o.texture,e.setRenderTarget(null),this._fsQuad.render(e))}_updateSelectionCache(){let e=this._selectionCache;function i(o){o.isMesh&&e.add(o)}e.clear();for(let o=0;o<this.selectedObjects.length;o++)this.selectedObjects[o].traverse(i)}_changeVisibilityOfSelectedObjects(e){let i=this._visibilityCache;for(let o of this._selectionCache)e===!0?o.visible=i.get(o):(i.set(o,o.visible),o.visible=e)}_changeVisibilityOfNonSelectedObjects(e){let i=this._visibilityCache,o=this._selectionCache;function r(t){if(t.isPoints||t.isLine||t.isLine2)e===!0?t.visible=i.get(t):(i.set(t,t.visible),t.visible=e);else if((t.isMesh||t.isSprite)&&!o.has(t)){let l=t.visible;(e===!1||i.get(t)===!0)&&(t.visible=e),i.set(t,l)}}this.renderScene.traverse(r)}_updateTextureMatrix(){this.textureMatrix.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),this.textureMatrix.multiply(this.renderCamera.projectionMatrix),this.textureMatrix.multiply(this.renderCamera.matrixWorldInverse)}_getPrepareMaskMaterial(){return new J({uniforms:{depthTexture:{value:null},cameraNearFar:{value:new P(.5,.5)},textureMatrix:{value:null}},vertexShader:`#include <batching_pars_vertex>
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

				}`})}_getEdgeDetectionMaterial(){return new J({uniforms:{maskTexture:{value:null},texSize:{value:new P(.5,.5)},visibleEdgeColor:{value:new E(1,1,1)},hiddenEdgeColor:{value:new E(1,1,1)}},vertexShader:`varying vec2 vUv;

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
				}`})}_getSeparableBlurMaterial(e){return new J({defines:{MAX_RADIUS:e},uniforms:{colorTexture:{value:null},texSize:{value:new P(.5,.5)},direction:{value:new P(.5,.5)},kernelRadius:{value:1}},vertexShader:`varying vec2 vUv;

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
				}`,blending:nt,depthTest:!1,depthWrite:!1,transparent:!0})}};fe.BlurDirectionX=new P(1,0);fe.BlurDirectionY=new P(0,1);var Ee={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
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

		}`};var ke=class extends A{constructor(){super(),this.isOutputPass=!0,this.uniforms=ce.clone(Ee.uniforms),this.material=new Rt({name:Ee.name,uniforms:this.uniforms,vertexShader:Ee.vertexShader,fragmentShader:Ee.fragmentShader}),this._fsQuad=new se(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,i,o){this.uniforms.tDiffuse.value=o.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},gt.getTransfer(this._outputColorSpace)===mt&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===lt?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===ut?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===dt?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===Ce?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===ft?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===ht?this.material.defines.NEUTRAL_TONE_MAPPING="":this._toneMapping===ct&&(this.material.defines.CUSTOM_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(i),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var Jt=15659250;function er(){let n=document.createElement("canvas");n.width=2,n.height=512;let e=n.getContext("2d"),i=e.createLinearGradient(0,0,0,512);i.addColorStop(0,"#d9dee2"),i.addColorStop(.55,"#e6eaed"),i.addColorStop(1,"#eef0f2"),e.fillStyle=i,e.fillRect(0,0,2,512);let o=new xe(n);return ae&&(o.colorSpace=ae),o}function tr(n){let i=2048/n,o=document.createElement("canvas");o.width=o.height=2048;let r=o.getContext("2d"),t=v=>v*i,l=2048/2,s=n/2,h=2.05,x=1.5;r.fillStyle="#e9ecee",r.fillRect(0,0,2048,2048),r.strokeStyle="rgba(148,156,163,.14)",r.lineWidth=Math.max(1,t(.05)),r.beginPath();for(let v=-s+1.15;v<=s;v+=4.6)r.moveTo(l+t(v),0),r.lineTo(l+t(v),2048),r.moveTo(0,l+t(v)),r.lineTo(2048,l+t(v));r.stroke();let p=t(h),b=t(x),m=t(s+1),c=new Path2D;c.moveTo(-m,-p),c.arcTo(-p,-p,-p,-m,b),c.lineTo(-p,-m),c.lineTo(p,-m),c.arcTo(p,-p,m,-p,b),c.lineTo(m,-p),c.lineTo(m,p),c.arcTo(p,p,p,m,b),c.lineTo(p,m),c.lineTo(-p,m),c.arcTo(-p,p,-m,p,b),c.lineTo(-m,p),c.closePath(),r.save(),r.translate(l,l),r.fillStyle="#3f444a",r.fill(c),r.save(),r.clip(c);for(let v=0;v<110;v++){let M=Math.random()*Math.PI*2,U=Math.random()*50,w=t(1.5+Math.random()*4),ee=Math.cos(M)*U*i,I=Math.sin(M)*U*i,te=r.createRadialGradient(ee,I,0,ee,I,w),H=Math.random()<.5;te.addColorStop(0,H?"rgba(38,42,47,.16)":"rgba(126,132,139,.14)"),te.addColorStop(1,"rgba(0,0,0,0)"),r.fillStyle=te,r.beginPath(),r.arc(ee,I,w,0,Math.PI*2),r.fill()}for(let v=0;v<3e4;v++){let M=72+Math.random()*78|0;r.fillStyle=`rgba(${M},${M+3},${M+7},${Math.random()*.13})`,r.fillRect(Math.random()*2048-l,Math.random()*2048-l,1.5,1.5)}r.restore(),r.lineWidth=t(.17),r.strokeStyle="#d3d8dc",r.stroke(c);let d=2,S=h+.5,R=.34,C=.5,L=.42;r.fillStyle="#f5f7f8";for(let v of[-1,1]){let M=v*t(S),U=t(d);for(let w=t(-h+R);w+t(C)<=t(h-R)+.01;w+=t(C+L))r.fillRect(Math.min(M,M+v*U),w,U,t(C));for(let w=t(-h+R);w+t(C)<=t(h-R)+.01;w+=t(C+L))r.fillRect(w,Math.min(M,M+v*U),t(C),U)}r.fillStyle="#f0f3f4";for(let v of[-1,1]){let M=v*t(S+d+.5);r.fillRect(M,t(-h+R),v*t(.26),t(h*2-2*R)),r.fillRect(t(-h+R),M,t(h*2-2*R),v*t(.26))}r.restore();let B=r.createRadialGradient(l,l,2048*.3,l,l,2048*.495);B.addColorStop(0,"rgba(238,240,242,0)"),B.addColorStop(1,"rgba(238,240,242,1)"),r.fillStyle=B,r.fillRect(0,0,2048,2048);let O=new xe(o);return O.anisotropy=8,ae&&(O.colorSpace=ae),O}function Ut(n){n.background=er(),n.fog=new Tt(Jt,45,110);let e=160,i=new k(new be(e,e),new X({map:tr(e),roughness:.96}));i.rotation.x=-Math.PI/2,i.receiveShadow=!0,n.add(i);let o=new K,r=[];function t(m,c,d,S,R,C,L){let B=new X({color:C,roughness:.88,transparent:!0,opacity:0}),O=new k(new Re(d,R,S),B);O.position.set(m,R/2,c),O.rotation.y=L??0,o.add(O),r.push(O)}let l=m=>Math.atan2(-Math.cos(m),-Math.sin(m)),s=[14080991,13357526,12765647,14541284],h=[[160,36,13,5,30,1],[190,35,14,5,28,1],[225,31,9,6,44,0],[258,34,12,5,34,2],[305,37,15,6,24,3],[60,36,13,5,28,1],[100,33,8,5,32,0]];for(let[m,c,d,S,R,C]of h){let L=m*Math.PI/180;t(Math.cos(L)*c,Math.sin(L)*c,d,S,R,C===0?3027769:s[C],l(L))}n.add(o);let x=new E;function p(m,c){n.fog.near=m*1.5,n.fog.far=m*3.4;for(let d of r){let S=x.copy(d.position).distanceTo(c);d.material.opacity=$.smoothstep(S,m*.8,m*1.15)*.85}}function b(){}return{update:b,setDistance:p}}var It=45,rr=46,ir=.45,ar=[[-1,1],[1,1],[-1,-1],[1,-1]],Ae=6.15,Gt=.23,sr=2.4,zt={home:["M4 11.4 12 4.8l8 6.6","M6.3 10.4v8.2h11.4v-8.2"],cross:["M12 5.6v12.8","M5.6 12h12.8"],face:["M8.9 13.6c.8 1.2 1.9 1.9 3.1 1.9s2.3-.7 3.1-1.9","M9.4 9.9h.01","M14.6 9.9h.01"],salon:["M8 8.3 19 16.5","M8 15.7 19 7.5"]};function Nt(n,e,i,o,r=!1){let t=n.width,l=n.height,s=n.getContext("2d");s.clearRect(0,0,t,l),s.strokeStyle="#c3cad1",s.lineWidth=3,s.beginPath(),s.moveTo(t/2,120),s.lineTo(t/2,244),s.stroke(),s.beginPath(),s.arc(t/2,256,10,0,Math.PI*2),s.fillStyle="#ffffff",s.fill(),s.strokeStyle="#aab2ba",s.stroke(),s.save(),s.shadowColor="rgba(40,50,60,.20)",s.shadowBlur=16,s.shadowOffsetY=5,s.beginPath(),s.roundRect?s.roundRect(10,10,t-20,110,55):s.rect(10,10,t-20,110),s.fillStyle="#ffffff",s.fill(),s.restore(),s.lineWidth=2,s.strokeStyle="#e6e9ec",s.stroke();let h=74,x=65,p=30;s.beginPath(),s.arc(h,x,p,0,Math.PI*2),s.fillStyle=r?"#202124":"#858585",s.fill(),s.save(),s.translate(h-15,x-15),s.scale(30/24,30/24),s.strokeStyle="#ffffff",s.lineWidth=2*(24/30),s.lineCap="round",s.lineJoin="round",o==="face"&&(s.beginPath(),s.arc(12,12,7.6,0,Math.PI*2),s.stroke()),o==="salon"&&(s.beginPath(),s.arc(6.3,6.9,2,0,Math.PI*2),s.stroke(),s.beginPath(),s.arc(6.3,17.1,2,0,Math.PI*2),s.stroke());for(let b of zt[o]||zt.home)s.stroke(new Path2D(b));s.restore(),s.textBaseline="middle",s.textAlign="left",s.fillStyle="#23282e",s.font="700 38px 'Microsoft YaHei','PingFang SC',system-ui,sans-serif",s.fillText(e,124,i?50:65),s.fillStyle="#8d949b",s.font="400 25px 'Microsoft YaHei','PingFang SC',system-ui,sans-serif",i&&s.fillText(i,124,93),s.fillStyle="#b9bfc6",s.font="400 46px system-ui,sans-serif",s.textAlign="center",s.fillText("\u203A",r?677:668,63)}function or(n,e,i){let t=document.createElement("canvas");t.width=720,t.height=300,Nt(t,n,e,i);let l=new xe(t);ae&&(l.colorSpace=ae),l.anisotropy=8;let s=8.2,h=s*300/720,x=new k(new be(s,h),new St({map:l,transparent:!0,depthWrite:!1,depthTest:!1,fog:!1,toneMapped:!1}));return x.renderOrder=10,x.userData.dotOffset=(.5-256/300)*h,x.userData.redraw=(p,b,m=!1)=>{Nt(t,p,b,i,m),l.needsUpdate=!0},x}function nr(n,e,i){let o=new wt,r=-n/2,t=-e/2;return o.moveTo(r+i,t),o.lineTo(r+n-i,t),o.quadraticCurveTo(r+n,t,r+n,t+i),o.lineTo(r+n,t+e-i),o.quadraticCurveTo(r+n,t+e,r+n-i,t+e),o.lineTo(r+i,t+e),o.quadraticCurveTo(r,t+e,r,t+e-i),o.lineTo(r,t+i),o.quadraticCurveTo(r,t,r+i,t),o}var he={slab:new X({color:15330800,roughness:.9}),bark:new X({color:6514797,roughness:.95}),leafA:new X({color:5465663,roughness:1}),leafB:new X({color:4676150,roughness:1}),hedge:new X({color:4677434,roughness:1}),planter:new X({color:14014940,roughness:.92})},Qe=null;function We(){let n=new K;if(Qe){let t=Qe.clone(!0);return t.rotation.y=Math.random()*Math.PI*2,t.scale.multiplyScalar(.85+Math.random()*.3),n.add(t),n}let e=new k(new ze(.1,.15,1.15,7),he.bark);e.position.y=.58;let i=new k(new Ne(.8,1),he.leafA);i.position.y=1.62,i.scale.set(1,.82,1);let o=new k(new Ne(.52,1),he.leafB);o.position.y=2.18,o.scale.set(1,.8,1);let r=new k(new ze(.55,.55,.12,12),he.planter);r.position.y=.06;for(let t of[e,i,o])t.castShadow=!0,t.receiveShadow=!0;return r.receiveShadow=!0,n.add(e,i,o,r),n}function lr(n){let e=n.clone(!0);e.traverse(l=>{l.isMesh&&l.material&&(l.material=l.material.clone(),l.material.color=new G(7309916))});let i=new de().setFromObject(e),o=i.getSize(new E),r=sr/o.y;e.scale.setScalar(r),e.position.y=-i.min.y*r;let t=new K;return t.add(e),t}function ur(n){let e=new K,i=2.72,o=[5.9,9.1,12.3];for(let r of[-1,1])for(let t of[-1,1]){for(let s of o){let h=We();h.position.set(r*i,0,t*s);let x=We();x.position.set(t*s,0,r*i);for(let p of[h,x])p.rotation.y=Math.random()*Math.PI*2,p.scale.setScalar(.85+Math.random()*.3),e.add(p)}let l=We();l.position.set(r*i,0,t*i),l.rotation.y=Math.random()*Math.PI*2,e.add(l)}n.add(e)}function dr(n){let e=new Re(1,1,1),i=Ae*2-2.4,o=Ae-.5;for(let[r,t,l,s]of[[0,o,i,.34],[0,-o,i,.34],[o,0,.34,i],[-o,0,.34,i]]){let h=new k(e,he.hedge);h.scale.set(l,.4,s),h.position.set(r,Gt+.2,t),h.castShadow=!0,h.receiveShadow=!0,n.add(h)}}async function jr(n,e,i){let{onEnter:o,onFailure:r,onMotion:t,labels:l}=i,s=new kt({canvas:n,antialias:!0,alpha:!1,powerPreference:"low-power"});s.setPixelRatio(Math.min(devicePixelRatio||1,e.maxDpr??1.5)),s.shadowMap.enabled=!0,s.shadowMap.type=st,s.shadowMap.autoUpdate=!1,s.toneMapping=Ce,s.toneMappingExposure=1.08;let h=new xt,x=Ut(h),p=new At,b=new Dt(s),m=b.fromScene(p,.04);h.environment=m.texture,h.environmentIntensity=.46,p.dispose(),b.dispose();let c=new _t(30,1,.1,600),d=new Ot(c,n);d.enabled=!1,Object.assign(d,{enableDamping:!0,dampingFactor:.07,enablePan:!1,rotateSpeed:.55,zoomSpeed:.8,minPolarAngle:Math.PI*.14,maxPolarAngle:Math.PI*.49,autoRotateSpeed:e.autoSpin??ir}),d.enableZoom=!0,n.addEventListener("wheel",a=>{a.ctrlKey||a.stopImmediatePropagation()},{capture:!0,passive:!0}),d.touches={ONE:null,TWO:at.DOLLY_ROTATE},n.style.touchAction="pan-y",h.add(new yt(16777215,13620440,.78));let S=new Ge(16777215,2.9);S.castShadow=!0,S.shadow.mapSize.set(e.shadowSize??2048,e.shadowSize??2048);let R=new Ge(15659765,.7);h.add(S,S.target,R);let C=new Lt;C.setDecoderPath(new URL("./draco/",import.meta.url).href),C.setWorkerLimit(1);let L=new Ft().setDRACOLoader(C),B=!1,O=!1,v=!1,M=0,U=!1,w=0,ee=!0,I=matchMedia("(prefers-reduced-motion: reduce)").matches,te=e.language||"en",H=[],je=null,Xe=null,V=null,Oe=matchMedia("(prefers-reduced-motion: reduce)"),pe={scale:1.04,durationMs:200,outlineWidth:2,...e.hover},Y,F;function Vt(){Y||(Y=new He(s),Y.addPass(new De(h,c)),F=new fe(new P(n.clientWidth,n.clientHeight),h,c),F.visibleEdgeColor.set(pe.outlineColor||"#fff"),F.hiddenEdgeColor.set("#000"),F.edgeThickness=pe.outlineWidth,F.downSampleRatio=2,F.pulsePeriod=0,F.overlayMaterial.blending=ot,F.overlayMaterial.uniforms.rimColor={value:new G(pe.shadowColor||"#303030")},F.overlayMaterial.fragmentShader=`
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
      }`,Y.addPass(F),Y.addPass(new ke),Y.setSize(n.clientWidth,n.clientHeight))}function oe(a,u="pointer"){u==="focus"?Xe=a:je=a;let f=je||Xe;if(V!==f){if(V=f,V){Vt();let g=c.position.clone(),T=d.target.clone(),N=d.enableDamping;d.autoRotate=!1,d.enableDamping=!1,d.update(0),c.position.copy(g),d.target.copy(T),d.update(0),d.enableDamping=N}for(let g of H){let T=g.spec.id===V;g.button.classList.toggle("is-highlighted",T),g.callout.userData.redraw(Fe(g.spec)[0],T?te==="en"?"Enter 360\xB0":"\u8FDB\u5165 360\xB0 \u7A7A\u95F4":"",T)}n.dataset.hovered=V||"",q()}}function Wt(a){let u=!1;for(let f of H){let g=f.spec.id===V?1:0,T=Oe.matches?1:a*1e3/pe.durationMs,N=f.hoverAmount;f.hoverAmount=g>N?Math.min(g,N+T):Math.max(g,N-T),u||=f.hoverAmount!==g;let y=f.hoverAmount*f.hoverAmount*(3-2*f.hoverAmount);f.visual.scale.setScalar(1+(Oe.matches?0:pe.scale-1)*y),f.callout.scale.setScalar(1+(Oe.matches?0:.025)*y),f.callout.position.y=f.calloutY+f.height*(f.visual.scale.x-1)*f.unit.scale.x,f.button.dataset.hoverScale=f.visual.scale.x.toFixed(4),N!==f.hoverAmount&&(ee=!0,s.shadowMap.needsUpdate=!0)}return u}function Ye(a){v||(v=!0,B=!1,d.enabled=!1,cancelAnimationFrame(M),M=0,r(a))}n.addEventListener("webglcontextlost",a=>{a.preventDefault(),Ye(new Error("World context lost"))});let qe=setTimeout(()=>Ye(new Error("World assets timed out")),3e4),Ze,$e;try{[Ze,$e]=await Promise.all([Promise.all(e.scenes.map(a=>L.loadAsync(new URL(a.model,document.baseURI).href))),L.loadAsync(new URL(e.tree,document.baseURI).href)])}catch(a){throw clearTimeout(qe),s.dispose(),C.dispose(),a}if(clearTimeout(qe),v)throw s.dispose(),C.dispose(),new Error("World load cancelled");Qe=lr($e.scene);let Fe=a=>te==="zh"?[a.name,a.desc]:[a.nameEn,a.descEn];H=e.scenes.map((a,u)=>{let f=Ze[u].scene;f.traverse(_=>{_.isMesh&&(_.castShadow=!0,_.receiveShadow=!0)}),f.rotation.y=$.degToRad(It-180+(a.yaw??180));let g=new de().setFromObject(f),T=g.getSize(new E),N=g.getCenter(new E),y=(a.footprint||11.2)/Math.max(T.x,T.z),D=new K,ie=new K,le=new K;f.scale.setScalar(y),f.position.set(-N.x*y,-g.min.y*y,-N.z*y),le.position.y=Gt+.015,le.add(f),ie.add(le);let ve=new k(new Ct(nr(Ae*2,Ae*2,1),{depth:.2,bevelEnabled:!0,bevelThickness:.025,bevelSize:.03,bevelSegments:2,curveSegments:10}),he.slab);ve.rotation.x=-Math.PI/2,ve.receiveShadow=!0,ie.add(ve),dr(ie),D.add(ie);let Q=or(Fe(a)[0],"",a.icon);return Q.position.y=T.y*y+.35-Q.userData.dotOffset,D.add(Q),h.add(D),{wrap:D,unit:ie,visual:le,model:f,callout:Q,spec:a,index:u,height:T.y*y,calloutY:Q.position.y,hoverAmount:0,button:l.get(a.id)}}),ur(h);let ne={position:new E,target:new E},Se=null;function Qt(a=!1){let u=ne.position.distanceTo(ne.target),f=c.position.clone().sub(d.target);Se=c.aspect<.9;let T=Se?16.2:18.7,N=Se?.8:1;for(let ue of H){let[we,qt]=ar[ue.index];ue.wrap.position.set(we*T/2,0,qt*T/2),ue.unit.scale.setScalar(N)}h.updateMatrixWorld(!0);let y=new de;for(let ue of H){y.union(new de().setFromObject(ue.unit));let we=ue.callout.getWorldPosition(new E);y.expandByPoint(we.clone().add(new E(4.1,1.71,4.1))),y.expandByPoint(we.clone().sub(new E(4.1,1.71,4.1)))}let D=y.getCenter(new E),ie=y.getBoundingSphere(new Mt),le=$.degToRad(c.fov),ve=2*Math.atan(Math.tan(le/2)*c.aspect),Q=ie.radius/Math.sin(Math.min(le,ve)/2)*(Se?.98:.94);ne.target.copy(D),ne.position.copy(D).add(new E().setFromSpherical(new ye(Q,$.degToRad(rr),$.degToRad(It)))),a||u===0?(c.position.copy(ne.position),d.target.copy(D)):(c.position.copy(D).add(f.multiplyScalar(Q/u)),d.target.copy(D)),d.minDistance=Q*.4,d.maxDistance=Q*1.6;let _=ie.radius;Object.assign(S.shadow.camera,{left:-_,right:_,top:_,bottom:-_,near:.1,far:_*8}),S.shadow.bias=-4e-4,S.position.copy(D).add(new E(_*.9,_*1.4,_*.6)),S.target.position.copy(D),S.shadow.camera.updateProjectionMatrix(),R.position.copy(D).add(new E(-_,_*1.2,-_)),s.shadowMap.needsUpdate=!0}let me=new E;function Ke(a,u){return me.copy(a),u.localToWorld(me),me.project(c),{x:(me.x*.5+.5)*n.clientWidth,y:(-me.y*.5+.5)*n.clientHeight}}function jt(){h.updateMatrixWorld(!0),c.updateMatrixWorld(!0);for(let a of H){let u=Ke(new E(-4,1.59446,0),a.callout),f=Ke(new E(4,3.4167*(.5-120/300),0),a.callout);Object.assign(a.button.style,{left:u.x+"px",top:u.y+"px",width:Math.max(1,f.x-u.x)+"px",height:Math.max(1,f.y-u.y)+"px"});let g=new de().setFromObject(a.model).getCenter(new E).project(c);a.button.dataset.buildingX=((g.x*.5+.5)*n.clientWidth).toFixed(1),a.button.dataset.buildingY=((-g.y*.5+.5)*n.clientHeight).toFixed(1)}}function Je(){for(let u of H)u.callout.quaternion.copy(c.quaternion);x.setDistance(c.position.distanceTo(d.target),c.position),x.update();let a=H.filter(u=>u.hoverAmount>0);Y&&a.length?(F.selectedObjects=a.map(u=>u.visual),F.edgeStrength=Math.max(...a.map(u=>u.hoverAmount)),Y.render()):s.render(h,c),n.dataset.outlined=a.map(u=>u.spec.id).join(","),jt(),Object.assign(n.dataset,{frames:String(Number(n.dataset.frames||0)+1),angle:d.getAzimuthalAngle().toFixed(5),distance:c.position.distanceTo(d.target).toFixed(5),paused:String(I)}),ee=!1}function Le(a){if(M=0,!B||v||!O){w=0;return}let u=w?(a-w)/1e3:0;if(w&&u<1/(e.maxFps||30)){M=requestAnimationFrame(Le);return}w=a,U=!0,d.autoRotate=!I&&!V;let f=Wt(u||1/60),g=d.update(Math.min(u,.1));(g||ee||d.autoRotate)&&Je(),U=!1,d.autoRotate||g||f?M=requestAnimationFrame(Le):w=0}function q(){ee=!0,!M&&B&&O&&!U&&!v&&(M=requestAnimationFrame(Le))}function Xt(a){B=!!a&&!v,d.enabled=B,B?q():(oe(null,"focus"),oe(null),n.style.cursor="grab",cancelAnimationFrame(M),M=0,w=0),n.dataset.active=String(B)}function ge(a){I=a,d.autoRotate=!I&&!V,t(I),q()}d.addEventListener("start",()=>{ge(!0)}),d.addEventListener("change",q);function et(){let a=Math.max(1,n.clientWidth),u=Math.max(1,n.clientHeight);s.setSize(a,u,!1),c.aspect=a/u,c.updateProjectionMatrix(),Qt(),Y?.setSize(a,u),q()}function tt(a){if(a==="pause"){ge(!I);return}if(ge(!0),a==="reset"){d.enableDamping=!1,d.update(0),c.position.copy(ne.position),d.target.copy(ne.target),d.update(0),d.enableDamping=!0,q();return}let u=c.position.clone().sub(d.target),f=new ye().setFromVector3(u);(a==="in"||a==="out")&&(f.radius=$.clamp(f.radius*(a==="in"?.85:1/.85),d.minDistance,d.maxDistance)),a==="left"&&(f.theta-=.12),a==="right"&&(f.theta+=.12),a==="up"&&(f.phi-=.08),a==="down"&&(f.phi+=.08),f.phi=$.clamp(f.phi,d.minPolarAngle,d.maxPolarAngle),c.position.copy(d.target).add(new E().setFromSpherical(f)),d.update(0),q()}let rt=new Ht;function it(a){let u=n.getBoundingClientRect();rt.setFromCamera(new P((a.clientX-u.left)/u.width*2-1,-((a.clientY-u.top)/u.height)*2+1),c);let f=rt.intersectObjects(H.map(T=>T.model),!0)[0];if(!f)return null;let g=f.object;for(;g.parent&&!H.some(T=>T.wrap===g);)g=g.parent;return H.find(T=>T.wrap===g)}let W=null,re=new Set;n.addEventListener("pointerdown",a=>{re.add(a.pointerId),re.size===1?W={x:a.clientX,y:a.clientY,moved:!1}:W&&(W.moved=!0),a.pointerType!=="touch"&&n.focus({preventScroll:!0})}),n.addEventListener("pointermove",a=>{if(W&&re.size&&Math.hypot(a.clientX-W.x,a.clientY-W.y)>7&&(W.moved=!0,oe(null)),a.pointerType==="mouse"&&!re.size){let u=it(a);n.style.cursor=u?"pointer":"grab",oe(u?.spec.id||null)}}),n.addEventListener("pointerleave",()=>oe(null)),n.addEventListener("pointerup",a=>{re.delete(a.pointerId)}),n.addEventListener("pointercancel",a=>{re.delete(a.pointerId),W&&(W.moved=!0)}),n.addEventListener("click",a=>{if(!B||W?.moved)return;let u=it(a);u&&(oe(null),n.focus({preventScroll:!0}),n.dataset.lastPick=u.spec.id,o(u.spec.id))}),n.addEventListener("keydown",a=>{let u={ArrowLeft:"left",ArrowRight:"right",ArrowUp:"up",ArrowDown:"down","+":"in","=":"in","-":"out"," ":"pause",Escape:"reset",Home:"reset"}[a.key];u&&(a.preventDefault(),tt(u))});let z=null;n.addEventListener("pointerdown",a=>{a.pointerType==="touch"&&re.size===1&&(z={id:a.pointerId,x:a.clientX,y:a.clientY,last:a.clientX,horizontal:!1})}),n.addEventListener("pointermove",a=>{if(!z||a.pointerId!==z.id||re.size!==1)return;let u=a.clientX-z.x,f=a.clientY-z.y;if(!z.horizontal&&Math.abs(u)>10&&Math.abs(u)>Math.abs(f)*1.2&&(z.horizontal=!0,ge(!0)),!z.horizontal)return;let g=c.position.clone().sub(d.target),T=new ye().setFromVector3(g);T.theta-=(a.clientX-z.last)*.006,z.last=a.clientX,c.position.copy(d.target).add(new E().setFromSpherical(T)),d.update(0),q()}),["pointerup","pointercancel"].forEach(a=>n.addEventListener(a,()=>{z=null}));function Yt(a){te=a;for(let u of H)u.callout.userData.redraw(Fe(u.spec)[0],u.spec.id===V?te==="en"?"Enter 360\xB0":"\u8FDB\u5165 360\xB0 \u7A7A\u95F4":"",u.spec.id===V);q()}return O=!0,et(),d.autoRotate=!1,d.update(0),Je(),t(I),{setActive:Xt,resize:et,action:tt,setLanguage:Yt,setPaused:ge,setHighlight:oe}}export{jr as createWorldRenderer};
