(function () {
    class Forro3DPreview {
        constructor(containerId) {
            this.container = document.getElementById(containerId);
            this.scene = null;
            this.camera = null;
            this.renderer = null;
            this.controls = null;
            this.roomGroup = null;
            this.panelLines = null;
            this.rafId = null;
            this.resizeObserver = null;
        }

        init() {
            if (!this.container || !window.THREE) return;

            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0xf8fafc);

            this.camera = new THREE.PerspectiveCamera(45, 1, 0.01, 1000);
            this.camera.position.set(8, 6, 8);

            this.renderer = new THREE.WebGLRenderer({ antialias: true });
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
            this.container.appendChild(this.renderer.domElement);

            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.08;
            this.controls.minDistance = 0.25;
            this.controls.maxDistance = 45;
            this.controls.minPolarAngle = 0.05;
            this.controls.maxPolarAngle = Math.PI - 0.05;
            this.controls.target.set(0, 1.5, 0);

            const ambient = new THREE.AmbientLight(0xffffff, 0.75);
            this.scene.add(ambient);

            const directional = new THREE.DirectionalLight(0xffffff, 0.6);
            directional.position.set(7, 10, 5);
            this.scene.add(directional);

            const grid = new THREE.GridHelper(24, 24, 0x16a34a, 0xd1d5db);
            grid.position.y = 0;
            this.scene.add(grid);

            this.roomGroup = new THREE.Group();
            this.scene.add(this.roomGroup);

            this.handleResize();
            this.resizeObserver = new ResizeObserver(() => this.handleResize());
            this.resizeObserver.observe(this.container);

            this.animate();
        }

        dispose() {
            if (this.rafId) cancelAnimationFrame(this.rafId);
            if (this.resizeObserver) this.resizeObserver.disconnect();
            if (this.renderer) this.renderer.dispose();
        }

        handleResize() {
            if (!this.container || !this.renderer || !this.camera) return;
            const width = this.container.clientWidth || 320;
            const height = this.container.clientHeight || 280;
            this.renderer.setSize(width, height);
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
        }

        animate() {
            this.rafId = requestAnimationFrame(() => this.animate());
            if (this.controls) this.controls.update();
            if (this.renderer && this.scene && this.camera) {
                this.renderer.render(this.scene, this.camera);
            }
        }

        clearRoom() {
            while (this.roomGroup.children.length) {
                const child = this.roomGroup.children.pop();
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => mat.dispose && mat.dispose());
                    } else if (child.material.dispose) {
                        child.material.dispose();
                    }
                }
            }
        }

        update(params) {
            if (!this.roomGroup) return;
            const largura = Math.max(0.2, Number(params.largura) || 0);
            const comprimento = Math.max(0.2, Number(params.comprimento) || 0);
            const altura = Math.max(2.2, Number(params.altura) || 2.8);
            const larguraPlaca = Math.max(0.05, Number(params.larguraPlaca) || 0.2);
            const orientacao = params.orientacao === "vertical" ? "vertical" : "horizontal";

            this.clearRoom();

            const roomGeo = new THREE.BoxGeometry(largura, altura, comprimento);
            const roomEdges = new THREE.EdgesGeometry(roomGeo);
            const roomWire = new THREE.LineSegments(
                roomEdges,
                new THREE.LineBasicMaterial({ color: 0x16a34a, linewidth: 1 })
            );
            roomWire.position.set(0, altura / 2, 0);
            this.roomGroup.add(roomWire);

            const ceilingGeo = new THREE.PlaneGeometry(largura, comprimento);
            const ceilingMat = new THREE.MeshStandardMaterial({
                color: 0xe2e8f0,
                transparent: true,
                opacity: 0.55,
                side: THREE.DoubleSide
            });
            const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
            ceiling.rotation.x = Math.PI / 2;
            ceiling.position.y = altura;
            this.roomGroup.add(ceiling);

            const linesGroup = new THREE.Group();
            const lineMaterial = new THREE.LineBasicMaterial({ color: 0x0f172a });
            const eixoTotal = orientacao === "horizontal" ? largura : comprimento;
            const steps = Math.ceil(eixoTotal / larguraPlaca);

            for (let i = 1; i < steps; i += 1) {
                const offset = -eixoTotal / 2 + (i * larguraPlaca);
                const points = orientacao === "horizontal"
                    ? [
                        new THREE.Vector3(offset, altura + 0.001, -comprimento / 2),
                        new THREE.Vector3(offset, altura + 0.001, comprimento / 2)
                    ]
                    : [
                        new THREE.Vector3(-largura / 2, altura + 0.001, offset),
                        new THREE.Vector3(largura / 2, altura + 0.001, offset)
                    ];

                const geom = new THREE.BufferGeometry().setFromPoints(points);
                const line = new THREE.Line(geom, lineMaterial);
                linesGroup.add(line);
            }

            this.roomGroup.add(linesGroup);

            const maxSize = Math.max(largura, comprimento, 3);
            this.controls.target.set(0, altura * 0.5, 0);
            this.camera.position.set(maxSize * 1.25, altura * 1.6, maxSize * 1.25);
            this.controls.update();
        }
    }

    window.Forro3DPreview = Forro3DPreview;
})();
