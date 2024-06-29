import { frames } from "@/app/utils/frames";
import { dummyProjects } from "@/app/utils/projectArray";
import { farcasterHubContext } from "frames.js/middleware";
import { createFrames, Button } from "frames.js/next";
import { NextRequest } from "next/server";
import { env } from "process";

const handleRequest = async (
    req: NextRequest,
    { params: { name: name } }: { params: { name: string } }
) => {
    return await frames(async (ctx) => {
        const url = new URL(req.url);
        const buttonPressed = url.searchParams.get('__bi');
        console.log(`Button pressed: ${buttonPressed}`);

        let currentProjectName = name || dummyProjects[0].name;
        const currentIndex = dummyProjects.findIndex(p => p.name === currentProjectName);

        if (buttonPressed === '1') { // Back button
            currentProjectName = currentIndex > 0 ? dummyProjects[currentIndex - 1].name : currentProjectName;
        } else if (buttonPressed === '4') { // Next button
            currentProjectName = currentIndex < dummyProjects.length - 1 ? dummyProjects[currentIndex + 1].name : currentProjectName;
        }

        console.log(`Current project name: ${currentProjectName}`);

        const currentProject = findProjectByName(currentProjectName);
        console.log(`Current project:`, currentProject);

        if (!currentProject) {
            console.log(`Project not found for name: ${currentProjectName}`);
            return {
                image: (
                    <div style={{ padding: "20px", textAlign: "center" }}>
                        Project not found
                    </div>
                ),
                buttons: [
                    <Button action="post" target={`/projects/${dummyProjects[0].name}`}>
                        Go to First Project
                    </Button>
                ]
            };
        }

        const projectIndex = dummyProjects.findIndex(project => project.name === currentProjectName);
        console.log(`Current project index: ${projectIndex}`);

        const prevProjectName = projectIndex > 0 ? dummyProjects[projectIndex - 1].name : "/projects";
        const nextProjectName = projectIndex < dummyProjects.length - 1 ? dummyProjects[projectIndex + 1].name : null;

        console.log(`Previous project: ${prevProjectName}`);
        console.log(`Next project: ${nextProjectName}`);

        function BgImage({ width = '100%', tw }: { width?: string; tw?: string }) {
            console.log(`Rendering image for project: ${currentProject?.name}`);
            return <img src={`${env.HOST_URL}/${currentProject?.imageName}`} alt="background" width={width} tw={tw} />;
        }

        return {
            image: (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        height: "100%",
                        position: "relative",
                    }}
                >
                    <BgImage />
                </div>
            ),
            imageOptions: {
                width: 650,
                height: 356,
            },
            buttons: [
                <Button action="post" target={`/projects/${prevProjectName || dummyProjects[dummyProjects.length - 1].name}`}>
                    👈 Back
                </Button>,
                <Button action="post" target={`/projects/${currentProject.name}/rewards`}>
                    ❤️❤️❤️
                </Button>,
                currentProject.wallet ?(
                <Button action="post" target={`/projects/${currentProject.name}/support`}>
                    Support 💰
                    </Button>
                ) : null,
                nextProjectName ? (
                    <Button action="post" target={`/projects/${nextProjectName}`}>
                        Next 👉
                    </Button>
                ) : (
                    <Button action="post" target={`/projects`}>
                        Home
                    </Button>
                ),
            ],
        };
    })(req)
};

export const GET = handleRequest;
export const POST = handleRequest;

function findProjectByName(name: string): (typeof dummyProjects)[number] | null {
    return dummyProjects.find(project => project.name === name) || null;
}