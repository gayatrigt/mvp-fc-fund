import { supabase } from "@/app/lib/supabaseClient";
import { frames } from "@/app/utils/frames";
import { dummyProjects } from "@/app/utils/projectArray";
import { farcasterHubContext } from "frames.js/middleware";
import { createFrames, Button } from "frames.js/next";
import { NextRequest } from "next/server";
import { env } from "process";
import { v4 as uuidv4 } from 'uuid';

const handleRequest = async (
    req: NextRequest,
    { params: { name: name } }: { params: { name: string } }
) => {
    return await frames(async (ctx) => {

        const data = findProjectByName(name);
        const amt = ctx.message?.inputText
        const chain = "base"
        console.log(`Current project:`, name);

        const fid = data?.fid

        const response = await fetch(`${env.HOST_URL}/utils/user-details?fid=${fid}`);
        const neynarData = await response.json();

        const wallet = data?.wallet || neynarData.users[0].verified_addresses.eth_addresses[0]

        const txn_id = uuidv4(); // Generate a unique ID
        let currentProjectName = name || dummyProjects[0].name;
        const projectIndex = dummyProjects.findIndex(project => project.name === currentProjectName);
        const prevProjectName = projectIndex > 0 ? dummyProjects[projectIndex - 1].name : "/projects";

        if (ctx.message?.transactionId) {

            const txnHash = ctx.message.transactionId

            if (txnHash && fid) {
                updateTxnHash(name, fid, txnHash)
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
                        <BgImage2 />
                    </div>
                ),
                imageOptions: {
                    width: 650,
                    height: 356,
                },
                buttons: [
                    <Button
                        action="link"
                        target={`https://www.onceupon.gg/tx/${ctx.message.transactionId}`}
                    >
                        View on block explorer
                    </Button>,
                    <Button action="post" target={`/projects`}>
                        Home
                    </Button>
                ],
            };
        }

        if (fid) {
            saveSupporttData(fid, txn_id, name, amt)
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
                    <div style={{
                        position: "absolute",
                        display: "flex",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                    }}>
                        <BgImage />
                    </div>
                    <div style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                    }}>
                        <div style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            flexDirection: "column",
                            textAlign: "center",
                            color: "white", // Ensure text is visible on the image
                            textShadow: "2px 2px 4px rgba(0,0,0,0.5)", // Optional: add shadow for better readability
                        }}>
                            <span style={{
                                fontSize: "30px",
                                marginTop: "30px",
                            }}>
                                You are supporting @{neynarData.users[0].username}
                            </span>
                            <span style={{
                                fontSize: "30px",
                            }}>for {currentProjectName}.
                            </span>
                            <span style={{
                                fontSize: "40px",
                                marginTop: "20px",
                            }}>
                                {amt} ETH
                            </span>
                        </div>
                    </div>
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
                <Button action="tx" target={{
                    pathname: `/txdata`, query: { amount: amt, wallet: wallet, chain: chain }
                }} post_url={`/projects/${name}/support/confirm`}>
                    Send ETH on Base
                </Button>,
            ],
        };
    })(req)
};

function BgImage({ width = '100%', tw }: { width?: string; tw?: string }) {
    return <img src={`${env.HOST_URL}/amtc.png`} alt="background" width={width} tw={tw} />;
}

function BgImage2({ width = '100%', tw }: { width?: string; tw?: string }) {
    return <img src={`${env.HOST_URL}/trans.png`} alt="background" width={width} tw={tw} />;
}

function findProjectByName(name: string): (typeof dummyProjects)[number] | null {
    return dummyProjects.find(project => project.name === name) || null;
}

async function saveSupporttData(fid: number, txn_id: string, projectName: string, amt: any) {
    try {

        const { data, error } = await supabase
            .from('MVP')
            .insert([
                { fid, txn_id, project_name: projectName, amount: amt }
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


async function updateTxnHash(projectName: string, fid: number, txnHash: string) {
    try {
        const { data, error } = await supabase
            .from('MVP')
            .update({ txn_hash: txnHash })
            .eq('project_name', projectName)
            .eq('fid', fid);

        if (error) {
            console.error('Error updating data:', error);
            throw error;
        }

        if (data) {
            console.log('Data updated successfully:', data);
            return true;
        } else {
            console.log('No matching row found for update');
            return false;
        }
    } catch (error) {
        console.error('Unexpected error:', error);
        throw error;
    }
}

export const GET = handleRequest;
export const POST = handleRequest;