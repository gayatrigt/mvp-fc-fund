import { supabase } from "@/app/lib/supabaseClient";
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

        const reward = ctx.message?.inputText
        const fid = ctx.message?.requesterFid

        if (reward && fid) {
            saveProjectData(fid, reward, name)
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
                <Button action="post" target={`/projects`}>
                    Home
                </Button>,
            ],
        };
    })(req)
};

function BgImage({ width = '100%', tw }: { width?: string; tw?: string }) {
    return <img src={`${env.HOST_URL}/confirm.png`} alt="background" width={width} tw={tw} />;
}

async function saveProjectData(fid: number, reward: string, projectName: string) {
    try {
        // Assuming you have a table named 'project_rewards'
        const { data, error } = await supabase
            .from('MVP')
            .insert([
                { fid, reward, project_name: projectName }
            ])

        if (error) {
            console.error('Error saving data:', error)
            return false
        }

        console.log('Data saved successfully:', data)
        return true
    } catch (error) {
        console.error('Unexpected error:', error)
        return false
    }
}

export const GET = handleRequest;
export const POST = handleRequest;