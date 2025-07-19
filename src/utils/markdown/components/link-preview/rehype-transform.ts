import { Element } from "hast";
import { find } from "unist-util-find";
import { toString } from "hast-util-to-string";
import { URL } from "url";
import { RehypeFunctionComponent } from "../types";
import { isElement } from "utils/markdown/unist-is-element";
import {
	ComponentMarkupNode,
	createComponent,
	PlayfulRoot,
} from "../components";
import { Plugin } from "unified";
import { getUrlMetadata } from "utils/hoof";
import { logError } from "utils/markdown/logger";

/**
 * Transform image-wrapped links into a link preview component
 * Expects: <a><picture><img/></picture></a> / [![](image.png)](url)
 */
export const rehypeLinkPreview: Plugin<[], PlayfulRoot> = () => {
	return (tree, _) => {
		for (let i = 0; i < tree.children.length; i++) {
			const element = tree.children[i];
			if (!isElement(element)) continue;
			const node = find<Element>(element, { type: "element", tagName: "a" });
			if (!node) continue;
			const pictureNode = find<Element>(node, {
				type: "element",
				tagName: "picture",
			});
			if (!pictureNode) continue;

			const replacement: ComponentMarkupNode = {
				type: "playful-component-markup",
				position: element.position,
				component: "link-preview",
				attributes: {},
				children: [element],
			};

			tree.children.splice(i, 1, replacement);
		}
	};
};

export const transformLinkPreview: RehypeFunctionComponent = async ({
	vfile,
	children,
	node,
}) => {
	const paragraphNode = children.filter(isElement).at(0);
	if (!paragraphNode) {
		logError(vfile, node, "Missing link preview contents");
		return;
	}
	const anchorNode = find<Element>(paragraphNode, {
		type: "element",
		tagName: "a",
	});
	if (!anchorNode) {
		logError(vfile, paragraphNode, "Missing a link element");
		return;
	}

	let url: URL;
	try {
		url = new URL(anchorNode.properties.href + "");
	} catch (e) {
		logError(vfile, anchorNode, "Malformatted URL");
		return;
	}

	const pictureNode = find<Element>(anchorNode, {
		type: "element",
		tagName: "picture",
	});
	const result = pictureNode
		? undefined
		: (await getUrlMetadata(url.toString()))?.banner;
	if (!pictureNode && !result) {
		logError(vfile, anchorNode, "Link preview could not find a banner image.");
		return;
	}

	return [
		createComponent(
			"LinkPreview",
			{
				type: "link",
				label: toString(anchorNode) || url.toString(),
				href: url.toString(),
				picture: result,
				alt: "",
			},
			pictureNode ? [pictureNode] : [],
		),
	];
};
