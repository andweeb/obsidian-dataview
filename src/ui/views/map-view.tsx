import { MarkdownRenderChild } from "obsidian";
import { executeMap } from "query/engine";
import { Query } from "query/query";
import { asyncTryOrPropogate } from "util/normalize";
import { useContext } from "preact/hooks";
import {
    DataviewContext,
    DataviewInit,
    ErrorMessage,
    ErrorPre,
    ReactRenderer,
    useIndexBackedState,
} from "ui/markdown";
import { h, Fragment } from "preact";
import { Literal } from "data-model/value";

export type MapViewState =
    | { status: "loading" }
    | { status: "error"; error: string }
    | { status: "ready"; items: Literal[] };

/** Pure view over list elements.  */
export function MapView({ query, sourcePath }: { query: Query; sourcePath: string }) {
    const context = useContext(DataviewContext);

    const state = useIndexBackedState<MapViewState>(
        context.container,
        context.app,
        context.settings,
        context.index,
        { status: "loading" },
        async () => {
            const result = await asyncTryOrPropogate(() =>
                executeMap(query, context.index, sourcePath, context.settings)
            );

            if (!result.successful) return {
                status: "error",
                error: result.error,
                sourcePath,
            };

            return { status: "ready", items: result.value.data };
        }
    );

    if (state.status == "loading")
        return (
            <Fragment>
                <ErrorPre>Loading...</ErrorPre>
            </Fragment>
        );
    else if (state.status == "error")
        return (
            <Fragment>
                {" "}
                <ErrorPre>Dataview: {state.error}</ErrorPre>{" "}
            </Fragment>
        );

    if (state.items.length == 0 && context.settings.warnOnEmptyResult)
        return <ErrorMessage message="Dataview: No results to show for the map query." />;

    return (
        <div>
            :)
        </div>
    );
}

export function createMapView(init: DataviewInit, query: Query, sourcePath: string): MarkdownRenderChild {
    return new ReactRenderer(init, <MapView query={query} sourcePath={sourcePath} />);
}
