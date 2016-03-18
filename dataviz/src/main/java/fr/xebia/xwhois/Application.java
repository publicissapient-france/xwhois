package fr.xebia.xwhois;

import fr.xebia.xwhois.infrastructure.MongoDbAnswers;
import fr.xebia.xwhois.infrastructure.WebServer;
import fr.xebia.xwhois.model.HitsPerDay;
import fr.xebia.xwhois.model.inbound.Answers;

public class Application {

    public static void main(String[] args) {
        Answers answers = new MongoDbAnswers(
            System.getenv("DATABASE_HOST"),
            System.getenv("DATABASE_USER"),
            System.getenv("DATABASE_PASSWORD")
        );

        String hitsPerDayAsJson = new HitsPerDay(answers).json();

        new WebServer(hitsPerDayAsJson).start();
    }

}
