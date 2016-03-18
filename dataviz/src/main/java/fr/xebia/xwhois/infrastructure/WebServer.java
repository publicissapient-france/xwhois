package fr.xebia.xwhois.infrastructure;

import org.eclipse.jetty.server.Handler;
import org.eclipse.jetty.server.Request;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.handler.*;
import org.eclipse.jetty.server.handler.gzip.GzipHandler;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

public class WebServer {

    private final Server server;

    public WebServer(String hitsPerDayAsJson) {
        ContextHandler hitsPerDayHandler = new ContextHandler("/hits-per-day.json");
        hitsPerDayHandler.setHandler(new HitsPerDayHandler(hitsPerDayAsJson));
        ResourceHandler resourceHandler = new ResourceHandler();
        resourceHandler.setDirectoriesListed(true);
        resourceHandler.setWelcomeFiles(new String[]{"index.html"});
        resourceHandler.setResourceBase("src/main/webapp");
        HandlerList handlers = new HandlerList();
        handlers.setHandlers(new Handler[]{
            hitsPerDayHandler,
            resourceHandler,
            new DefaultHandler()});
        GzipHandler gzip = new GzipHandler();
        gzip.setHandler(handlers);
        server = new Server(8080);
        server.setHandler(gzip);
    }

    public void start() {
        try {
            server.start();
            server.join();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static class HitsPerDayHandler extends AbstractHandler {
        private final String hitsPerDayAsJson;

        public HitsPerDayHandler(String hitsPerDayAsJson) {
            this.hitsPerDayAsJson = hitsPerDayAsJson;
        }

        @Override
        public void handle(String target, Request baseRequest, HttpServletRequest request, HttpServletResponse response)
            throws IOException, ServletException {
            response.setContentType("application/json; charset=utf-8");
            response.setStatus(HttpServletResponse.SC_OK);
            PrintWriter out = response.getWriter();
            out.println(hitsPerDayAsJson);
            baseRequest.setHandled(true);
        }
    }
}
